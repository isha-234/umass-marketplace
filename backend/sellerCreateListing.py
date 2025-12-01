from fastapi import APIRouter, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from bson.objectid import ObjectId
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime
import time
import shutil
from database import get_items_collection

# Load environment variables
load_dotenv()

items_collection = get_items_collection()

# Ensure upload directory exists alongside backend code
UPLOAD_DIR = Path(__file__).resolve().parent / "uploaded_images"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter()

@router.post("/listing/insert")
async def submit_item(
    title: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    condition: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    deliveryOption: str = Form(...),
    contactEmail: str = Form(...),
    contactPhone: str = Form(...),
    images: list[UploadFile] = File(...)
):
    image_paths: list[str] = []

    # Save images to disk
    for img in images:
        filename = f"{int(time.time())}_{img.filename}"
        file_path = UPLOAD_DIR / filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(img.file, buffer)
        image_paths.append(f"/uploaded_images/{filename}")  # relative path for serving

    # Create MongoDB document
    document = {
        "title": title,
        "price": price,
        "category": category,
        "condition": condition,
        "description": description,
        "location": location,
        "deliveryOption": deliveryOption,
        "contactEmail": contactEmail,
        "contactPhone": contactPhone,
        "images": image_paths,  # store file paths, not base64
        "createdAt": datetime.utcnow(),
    }

    # Motor returns a coroutine; await it to get the InsertOneResult
    result = await items_collection.insert_one(document)
    return {"status": "success", "id": str(result.inserted_id), "title": title, "images": image_paths}

@router.get("/listing/all")
async def get_all_listings(
    q: str | None = Query(None, description="Search term for title/description"),
    category: str | None = Query(None, description="Filter by category"),
    condition: str | None = Query(None, description="Filter by condition"),
    sort: str | None = Query("newest", description="Sort by newest|price_asc|price_desc"),
):
    query: dict = {}
    if q:
        regex = {"$regex": q, "$options": "i"}
        query["$or"] = [{"title": regex}, {"description": regex}]
    if category:
        query["category"] = category
    if condition:
        query["condition"] = condition

    cursor = items_collection.find(query)

    sort_spec = [("createdAt", -1)]
    if sort == "price_asc":
        sort_spec = [("price", 1)]
    elif sort == "price_desc":
        sort_spec = [("price", -1)]
    cursor = cursor.sort(sort_spec)

    listings = await cursor.to_list(length=None)
    # Convert ObjectId to string for JSON
    for listing in listings:
        if isinstance(listing.get("_id"), ObjectId):
            listing["_id"] = str(listing["_id"])
    # Ensure any ObjectId/datetime fields are serializable
    return JSONResponse(content=jsonable_encoder(listings))


@router.get("/listing/categories")
async def get_categories():
    # Return all distinct categories for filter UI
    categories = await items_collection.distinct("category")
    # Remove falsy/None categories and sort alphabetically
    cleaned = sorted({c for c in categories if c})
    return {"categories": cleaned}


@router.get("/listing/conditions")
async def get_conditions():
    conditions = await items_collection.distinct("condition")
    cleaned = sorted({c for c in conditions if c})
    return {"conditions": cleaned}
