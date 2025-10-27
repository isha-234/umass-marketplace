from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import base64

load_dotenv()

app = FastAPI()

# CORS: allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB")
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db["items"]

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
    image_data = []
    for img in images:
        content = await img.read()
        encoded = base64.b64encode(content).decode("utf-8")
        image_data.append(encoded)

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
        "images": image_data,
    }
    collection.insert_one(document)
    return {"status": "success", "title": title}
