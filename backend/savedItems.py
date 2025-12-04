from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Body, Depends, HTTPException

from auth import get_current_user
from database import get_saved_items_collection, get_items_collection

router = APIRouter()
saved_items_collection = get_saved_items_collection()
items_collection = get_items_collection()


@router.post("/saved-items")
async def save_item(listingId: str = Body(..., embed=True), user=Depends(get_current_user)):
    if not listingId:
        raise HTTPException(status_code=400, detail="listingId is required")
    try:
        obj_id = ObjectId(listingId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid listingId")

    user_id = user.get("uid")
    email = user.get("email")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    await saved_items_collection.update_one(
        {"userId": user_id},
        {
            "$addToSet": {"itemIds": obj_id},
            "$setOnInsert": {"createdAt": datetime.utcnow(), "email": email},
        },
        upsert=True,
    )
    return {"status": "saved", "listingId": listingId}


@router.delete("/saved-items")
async def unsave_item(listingId: str = Body(..., embed=True), user=Depends(get_current_user)):
    if not listingId:
        raise HTTPException(status_code=400, detail="listingId is required")
    try:
        obj_id = ObjectId(listingId)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid listingId")

    user_id = user.get("uid")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    result = await saved_items_collection.update_one(
        {"userId": user_id},
        {"$pull": {"itemIds": obj_id}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not saved")
    return {"status": "unsaved", "listingId": listingId}


@router.get("/saved-items")
async def list_saved_items(user=Depends(get_current_user)):
    user_id = user.get("uid")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    doc = await saved_items_collection.find_one({"userId": user_id})
    item_ids = []
    if doc and doc.get("itemIds"):
        item_ids = [str(oid) for oid in doc["itemIds"] if isinstance(oid, ObjectId)]
    return {"itemIds": item_ids}


@router.get("/saved-items/listings")
async def saved_items_listings(user=Depends(get_current_user)):
    user_id = user.get("uid")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user")

    doc = await saved_items_collection.find_one({"userId": user_id})
    oids = [oid for oid in (doc.get("itemIds") if doc else []) if isinstance(oid, ObjectId)]
    if not oids:
        return {"items": []}

    listings = await items_collection.find({"_id": {"$in": oids}}).to_list(length=None)
    for l in listings:
        if isinstance(l.get("_id"), ObjectId):
            l["_id"] = str(l["_id"])
    return {"items": listings}
