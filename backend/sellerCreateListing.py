from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
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
    status: str = Form(...),
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
        "status": status,
        "createdAt": datetime.utcnow(),
    }

    # Motor returns a coroutine; await it to get the InsertOneResult
    result = await items_collection.insert_one(document)
    return {"status": "success", "id": str(result.inserted_id), "title": title, "images": image_paths}
