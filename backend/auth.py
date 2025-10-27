from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, EmailStr
from database import users_collection

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user: UserSignup):
    if not user.email.lower().endswith("@umass.edu"):
        raise HTTPException(status_code=400, detail="UMass email required")

    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_pw = await run_in_threadpool(hash_password, user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_pw,
        "isVerified": False,
        "createdAt": datetime.utcnow()
    }

    print("Adding new user..")
    await users_collection.insert_one(new_user)
    print("User added!")
    return {"msg": "User created successfully"}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await users_collection.find_one({"email": form_data.username})
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    
    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    token = create_access_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
async def get_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = await users_collection.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"name": user["name"], "email": user["email"], "verified": user.get("isVerified", False)}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
