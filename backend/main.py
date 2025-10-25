from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db["form_submissions"]

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for all origins (so browser can access backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # allow all origins (for testing)
    allow_credentials=True,
    allow_methods=["*"],       # allow all HTTP methods
    allow_headers=["*"],       # allow all headers
)

# Define form data structure
class FormData(BaseModel):
    name: str
    email: str
    message: str

# Endpoint to submit form data
@app.post("/submit-form")
async def submit_form(data: FormData):
    result = collection.insert_one(data.dict())
    return {"status": "success", "id": str(result.inserted_id)}

# Endpoint to retrieve all submissions
@app.get("/submissions")
async def get_submissions():
    submissions = list(collection.find({}, {"_id": 0}))  # exclude MongoDB _id
    return submissions

