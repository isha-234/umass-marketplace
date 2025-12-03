from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from bson.objectid import ObjectId
from datetime import datetime

from database import (
    get_items_collection,
    get_conversations_collection,
    get_messages_collection,
)
from auth import get_current_user

router = APIRouter()

items_collection = get_items_collection()
conversations_collection = get_conversations_collection()
messages_collection = get_messages_collection()


# ---------- Pydantic models ----------

class ConversationOut(BaseModel):
    id: str
    listingId: str
    listingTitle: Optional[str] = None
    buyerId: str          # buyer email
    sellerId: str         # seller email (from listing.contactEmail)
    lastMessageText: Optional[str] = None
    lastMessageAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime


class MessageOut(BaseModel):
    id: str
    conversationId: str
    senderId: str         # email of buyer or seller
    text: str
    createdAt: datetime


class StartConversationBody(BaseModel):
    listing_id: str


class SendMessageBody(BaseModel):
    text: str


def oid_str(oid) -> str:
    return str(oid) if isinstance(oid, ObjectId) else str(oid)


# ---------- 1. Start or get conversation ----------

@router.post("/conversations/start", response_model=ConversationOut)
async def start_conversation(
    body: StartConversationBody,
    user: dict = Depends(get_current_user),
):
    """
    Start (or reuse) a conversation between:
      - buyer: current user's email
      - seller: listing.contactEmail
    for a specific listing.
    """
    buyer_email = user.get("email")
    if not buyer_email:
        raise HTTPException(status_code=401, detail="User email missing")

    listing_id = body.listing_id

    if not ObjectId.is_valid(listing_id):
        raise HTTPException(status_code=400, detail="Invalid listing id")

    listing = await items_collection.find_one({"_id": ObjectId(listing_id)})
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    seller_email = listing.get("contactEmail")
    if not seller_email:
        raise HTTPException(status_code=500, detail="Listing missing contactEmail")

    # prevent chat with own listing (same email)
    if seller_email == buyer_email:
        raise HTTPException(
            status_code=400,
            detail="You cannot start a conversation with your own listing.",
        )

    # check if conversation already exists for this buyer + listing
    existing = await conversations_collection.find_one(
        {"listingId": listing_id, "buyerId": buyer_email}
    )

    now = datetime.utcnow()

    if existing:
        return ConversationOut(
            id=oid_str(existing["_id"]),
            listingId=listing_id,
            listingTitle=listing.get("title"),
            buyerId=existing["buyerId"],
            sellerId=existing["sellerId"],
            lastMessageText=existing.get("lastMessageText"),
            lastMessageAt=existing.get("lastMessageAt"),
            createdAt=existing.get("createdAt", now),
            updatedAt=existing.get("updatedAt", now),
        )

    # create new conversation
    doc = {
        "listingId": listing_id,
        "buyerId": buyer_email,
        "sellerId": seller_email,
        "lastMessageText": None,
        "lastMessageAt": None,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await conversations_collection.insert_one(doc)

    return ConversationOut(
        id=oid_str(result.inserted_id),
        listingId=listing_id,
        listingTitle=listing.get("title"),
        buyerId=buyer_email,
        sellerId=seller_email,
        lastMessageText=None,
        lastMessageAt=None,
        createdAt=now,
        updatedAt=now,
    )


# ---------- 2. Get all conversations for current user ----------

@router.get("/conversations", response_model=List[ConversationOut])
async def get_my_conversations(user: dict = Depends(get_current_user)):
    """
    Return all conversations where the user is:
      - buyer (buyerId == user.email) OR
      - seller (sellerId == user.email)
    """
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="User email missing")

    cursor = conversations_collection.find(
        {
            "$or": [
                {"buyerId": user_email},
                {"sellerId": user_email},
            ]
        }
    ).sort("updatedAt", -1)

    conv_docs = await cursor.to_list(length=None)

    # pull listing titles
    listing_ids = list({d["listingId"] for d in conv_docs})
    listing_objs = await items_collection.find(
        {"_id": {"$in": [ObjectId(lid) for lid in listing_ids if ObjectId.is_valid(lid)]}}
    ).to_list(length=None)
    listing_map = {str(l["_id"]): l for l in listing_objs}

    now = datetime.utcnow()
    result: list[ConversationOut] = []
    for d in conv_docs:
        listing = listing_map.get(d["listingId"])
        listing_title = listing.get("title") if listing else None

        result.append(
            ConversationOut(
                id=oid_str(d["_id"]),
                listingId=d["listingId"],
                listingTitle=listing_title,
                buyerId=d["buyerId"],
                sellerId=d["sellerId"],
                lastMessageText=d.get("lastMessageText"),
                lastMessageAt=d.get("lastMessageAt"),
                createdAt=d.get("createdAt", now),
                updatedAt=d.get("updatedAt", now),
            )
        )

    return result


# ---------- 3. Get messages in a conversation ----------

@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=List[MessageOut],
)
async def get_messages(
    conversation_id: str,
    user: dict = Depends(get_current_user),
):
    """
    Get all messages for a conversation, if the user is either the buyer or seller.
    """
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="User email missing")

    if not ObjectId.is_valid(conversation_id):
        raise HTTPException(status_code=400, detail="Invalid conversation id")

    conv = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if user_email not in (conv["buyerId"], conv["sellerId"]):
        raise HTTPException(status_code=403, detail="Not allowed")

    cursor = messages_collection.find(
        {"conversationId": conversation_id}
    ).sort("createdAt", 1)

    docs = await cursor.to_list(length=None)

    return [
        MessageOut(
            id=oid_str(d["_id"]),
            conversationId=d["conversationId"],
            senderId=d["senderId"],
            text=d["text"],
            createdAt=d["createdAt"],
        )
        for d in docs
    ]


# ---------- 4. Send a message in a conversation ----------

@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    conversation_id: str,
    body: SendMessageBody,
    user: dict = Depends(get_current_user),
):
    """
    Send a message in a conversation.
    SenderId is always the user's email (buyer or seller).
    """
    user_email = user.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="User email missing")

    if not ObjectId.is_valid(conversation_id):
        raise HTTPException(status_code=400, detail="Invalid conversation id")

    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    conv = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # user must be part of this conversation
    if user_email not in (conv["buyerId"], conv["sellerId"]):
        raise HTTPException(status_code=403, detail="Not allowed")

    now = datetime.utcnow()

    msg_doc = {
        "conversationId": conversation_id,  # store as string
        "senderId": user_email,             # email of buyer or seller
        "text": text,
        "createdAt": now,
    }
    result = await messages_collection.insert_one(msg_doc)
    msg_id = oid_str(result.inserted_id)

    # update conversation last message
    await conversations_collection.update_one(
        {"_id": ObjectId(conversation_id)},
        {
            "$set": {
                "lastMessageText": text,
                "lastMessageAt": now,
                "updatedAt": now,
            }
        },
    )

    return MessageOut(
        id=msg_id,
        conversationId=conversation_id,
        senderId=user_email,
        text=text,
        createdAt=now,
    )
