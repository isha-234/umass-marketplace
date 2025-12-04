from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime
from typing import Optional
import time
import shutil
from database import get_items_collection
from auth import get_current_user
from bson import ObjectId


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
    images: Optional[list[UploadFile]] = File(None),
    existingImages: list[str] = Form([]),
    listingId: str = Form(None),
    user=Depends(get_current_user),
    status: str = Form(...)
):
    images = images or []
    image_paths: list[str] = [img for img in existingImages if img]
    contactEmail = contactEmail or user.get("email", "")

    # Save images to disk
    for img in images:
        filename = f"{int(time.time())}_{img.filename}"
        file_path = UPLOAD_DIR / filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(img.file, buffer)
        image_paths.append(f"/uploaded_images/{filename}")  # relative path for serving

    base_doc = {
        "title": title,
        "price": price,
        "category": category,
        "condition": condition,
        "description": description,
        "location": location,
        "deliveryOption": deliveryOption,
        "contactEmail": contactEmail,
        "images": image_paths,
        "status": status,
        "ownerUid": user.get("uid"),
    }

    if listingId:
        try:
            oid = ObjectId(listingId)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid listingId")

        update_doc = {
            **base_doc,
            "updatedAt": datetime.utcnow(),
        }
        result = await items_collection.update_one(
            {"_id": oid, "ownerUid": user.get("uid")},
            {"$set": update_doc},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Draft not found")
        return {"status": "updated", "id": listingId, "images": image_paths}

    # Create MongoDB document
    document = {
        **base_doc,
        "createdAt": datetime.utcnow(),
    }

    result = await items_collection.insert_one(document)
    return {"status": "success", "id": str(result.inserted_id), "title": title, "images": image_paths}
