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

# POST endpoint to submit item
@app.post("/submit-item")
async def submit_item(
    item_name: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    images: list[UploadFile] = File(...)
):
    image_data = []
    for img in images:
        content = await img.read()
        encoded = base64.b64encode(content).decode("utf-8")
        image_data.append(encoded)
    
    document = {
        "item_name": item_name,
        "category": category,
        "description": description,
        "price": price,
        "images": image_data
    }
    collection.insert_one(document)
    return {"status": "success", "item_name": item_name}
