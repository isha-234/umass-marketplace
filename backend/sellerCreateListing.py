from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId
import os
import time
import shutil

# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db["items"]

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploaded_images", StaticFiles(directory=UPLOAD_DIR), name="uploaded_images")

@app.post("/listing/insert")
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
    image_paths = []

    # Save images to disk
    for img in images:
        filename = f"{int(time.time())}_{img.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
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

    collection.insert_one(document)
    return {"status": "success", "title": title, "images": image_paths}

@app.get("/listing/all")
def get_all_listings():
    listings = list(collection.find())
    # Convert ObjectId to string for JSON
    for l in listings:
        l["_id"] = str(l["_id"])
    return JSONResponse(content=listings)

@app.get("/")
def root():
    return {"message": "Backend is running!"}
