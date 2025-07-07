from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from core.database import get_db
from schemas import UserCreate, UserOut
from core.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db = Depends(get_db("CollabraDoc"))
):
    if db.users.find_one({"email": user_in.email}):
        raise HTTPException(400, "Email already exists")
        
    hashed_password = hash_password(user_in.password)

    user_data = user_in.model_dump()

    user_data["password"] = hashed_password
    
    result = db.users.insert_one(user_data)

    return UserOut(id=str(result.inserted_id), **user_data)
