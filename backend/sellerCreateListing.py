from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from bson.objectid import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient
from pathlib import Path
import os
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
    }

    result = items_collection.insert_one(document)
    return {"status": "success", "id": str(result.inserted_id), "title": title, "images": image_paths}

@router.get("/listing/all")
def get_all_listings():
    listings = list(items_collection.find())
    # Convert ObjectId to string for JSON
    for listing in listings:
        if isinstance(listing.get("_id"), ObjectId):
            listing["_id"] = str(listing["_id"])
    return JSONResponse(content=listings)
