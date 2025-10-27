from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os, certifi

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise Exception("❌ MONGODB_URI not found in environment variables")

client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())  # ✅ use trusted cert
db = client["umass_db"]
users_collection = db["user"]
