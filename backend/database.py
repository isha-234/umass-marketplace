from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os, certifi

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    raise Exception("MONGODB_URI not found in environment variables")

client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
db = client["umass_db"]

def get_users_collection():
    users_collection = db["user"]
    return users_collection

def get_items_collection():
    items_collection = db["items"]
    return items_collection

def get_saved_items_collection():
    return db["saved_items"]

def get_conversations_collection():   
    return db["conversations"]

def get_messages_collection():
    return db["messages"]

