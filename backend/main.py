from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
# from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Load backend/.env before importing modules that depend on FIREBASE_CREDENTIALS_FILE
# env_path = Path(__file__).resolve().parent / ".env"
# load_dotenv(env_path)
load_dotenv()

from auth import router as auth_router
from sellerCreateListing import router as seller_router, UPLOAD_DIR
from ViewListings import router as view_listings_router
from ai_assist import router as ai_assist_router
import os
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # Allow local dev frontends (Vite/CRA defaults)
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(seller_router)
app.include_router(view_listings_router)
app.include_router(ai_assist_router)
app.mount("/uploaded_images", StaticFiles(directory=str(UPLOAD_DIR)), name="uploaded_images")

@app.get("/")
async def root():
    return {"message": "FastAPI backend connected!"}
