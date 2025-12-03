from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth

from database import get_users_collection
from firebase_admin_setup import initialize_firebase_app

router = APIRouter()
security = HTTPBearer(auto_error=False)
users_collection = get_users_collection()

initialize_firebase_app()


async def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security),
):
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )

    try:
        decoded = firebase_auth.verify_id_token(token.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    if not decoded.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not verified",
        )

    email = decoded.get("email")
    user_doc = await users_collection.find_one({"uid": uid}) or (
        await users_collection.find_one({"email": email}) if email else None
    )
    # Lazily create or refresh the user record so Mongo mirrors Firebase.
    upsert_doc = {
        "uid": uid,
        "email": email,
        "name": decoded.get("name") or decoded.get("email"),
        "emailVerified": decoded.get("email_verified", False),
        "lastLoginAt": datetime.utcnow(),
    }
    if not user_doc:
        upsert_doc["createdAt"] = datetime.utcnow()
        await users_collection.insert_one(upsert_doc)
    else:
        await users_collection.update_one({"_id": user_doc["_id"]}, {"$set": upsert_doc})

    return decoded


@router.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return {
        "uid": user.get("uid"),
        "email": user.get("email"),
        "email_verified": user.get("email_verified", False),
    }
