from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from fastapi.staticfiles import StaticFiles
from sellerCreateListing import router as seller_router, UPLOAD_DIR
import os

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:51"],  # React frontend 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(seller_router)

app.mount("/uploaded_images", StaticFiles(directory=str(UPLOAD_DIR)), name="uploaded_images")

@app.get("/")
async def root():
    return {"message": "FastAPI backend connected!"}
