from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from bson.objectid import ObjectId
from database import get_items_collection

router = APIRouter()
items_collection = get_items_collection()


@router.get("/listing/all")
async def get_all_listings(
    q: str | None = Query(None, description="Search term for title/description"),
    category: str | None = Query(None, description="Filter by category"),
    condition: str | None = Query(None, description="Filter by condition"),
    sort: str | None = Query("newest", description="Sort by newest|price_asc|price_desc"),
):
    query: dict = {}
    # Text search: simple regex on title/description.
    if q:
        regex = {"$regex": q, "$options": "i"}
        query["$or"] = [{"title": regex}, {"description": regex}]
    if category:
        query["category"] = category
    if condition:
        query["condition"] = condition

    cursor = items_collection.find(query)

    # Default newest-first; allow price sorting.
    sort_spec = [("createdAt", -1)]
    if sort == "price_asc":
        sort_spec = [("price", 1)]
    elif sort == "price_desc":
        sort_spec = [("price", -1)]
        cursor = cursor.sort(sort_spec)
    cursor = cursor.sort(sort_spec)

    listings = await cursor.to_list(length=None)
    for listing in listings:
        if isinstance(listing.get("_id"), ObjectId):
            listing["_id"] = str(listing["_id"])
    return JSONResponse(content=jsonable_encoder(listings))


@router.get("/listing/categories")
async def get_categories():
    categories = await items_collection.distinct("category")
    cleaned = sorted({c for c in categories if c})
    return {"categories": cleaned}


@router.get("/listing/conditions")
async def get_conditions():
    conditions = await items_collection.distinct("condition")
    cleaned = sorted({c for c in conditions if c})
    return {"conditions": cleaned}

@router.get("/listing/user/published")
async def get_my_published_listings(email: str):
    cursor = items_collection.find({"contactEmail": email, "status": "published"})
    listings = await cursor.to_list(None)

    for listing in listings:
        listing["_id"] = str(listing["_id"])

    return listings


@router.get("/listing/user/drafts")
async def get_my_draft_listings(email: str):
    cursor = items_collection.find({"contactEmail": email, "status": "draft"})
    listings = await cursor.to_list(None)

    for listing in listings:
        listing["_id"] = str(listing["_id"])

    return listings
