import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("MONGODB_DB")]
events_collection = db["events"]

sample_events = [
    {
        "title": "UMass Amherst Farmers Market",
        "date": "2024-10-26",
        "location": "Goodell Lawn",
        "description": "Weekly farmers market featuring local vendors and artisans. Fresh produce, handmade goods, and campus community gathering.",
        "category": "Community",
        "image": ""
    },
    {
        "title": "Student Business Pop-Up Shop",
        "date": "2024-11-12",
        "location": "Campus Center Auditorium",
        "description": "Discover and support student-run businesses.",
        "category": "Business",
        "image": ""
    },
    {
        "title": "New2U Tag Sale",
        "date": "2024-12-03",
        "location": "Student Union Ballroom",
        "description": "Shop lowcost, used dorm items, clothing, and essentials donated during UMass move out.",
        "category": "Reuse and Resale",
        "image": ""
    },
    {
        "title": "Tech and Innovation Expo",
        "date": "2024-11-20",
        "location": "Integrated Sciences Building",
        "description": "Explore cutting-edge student projects and startup ideas.",
        "category": "Technology",
        "image": ""
    },
    {
        "title": "Vintage Marketplace",
        "date": "2024-12-10",
        "location": "Old Chapel Courtyard",
        "description": "Find unique vintage clothing and collectibles.",
        "category": "Fashion",
        "image": ""
    },
    {
        "title": "Book and Media Exchange",
        "date": "2024-11-30",
        "location": "Du Bois Library Plaza",
        "description": "Buy, sell, or trade textbooks, novels, vinyl records, and media.",
        "category": "Books and Media",
        "image": ""
    },
    {
        "title": "Student Music Fest",
        "date": "2024-12-15",
        "location": "Fine Arts Center",
        "description": "Enjoy performances by student bands and musical ensembles.",
        "category": "Music",
        "image": ""
    }
]

async def seed():
    await events_collection.delete_many({})
    await events_collection.insert_many(sample_events)
    print("Seeded all events!")

if __name__ == "__main__":
    asyncio.run(seed())
