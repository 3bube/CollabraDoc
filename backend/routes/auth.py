from fastapi.security  import OAuth2PasswordRequestForm
from fastapi.responses import Response, JSONResponse
from core.database import get_db
from core.jwt import create_access_token
from core.security import verify_password
from fastapi import APIRouter, Depends, HTTPException, status
from schemas import UserOut
from schemas import UserCreate, UserOut
from core.security import hash_password


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
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



@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db("CollabraDoc"))
):
    # With OAuth2PasswordRequestForm, username field contains the email
    email = form_data.username
    password = form_data.password
    
    user_doc = db.users.find_one({"email": email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    
    # Instead of using Pydantic model, work directly with the MongoDB document
    if not verify_password(password, user_doc["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(data={"sub": str(user_doc["_id"])})

    user_data = {
        "id" : str(user_doc["_id"]),
        "name" : user_doc.get("full_name", "Unknown User"),  # Use get to avoid KeyError
        "email": user_doc["email"]
    }

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Login successful",
            "user": user_data,
            "access_token": token,
        }
    )


@router.post("/logout")
def logout():
    """Logout user"""
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Logout successful"}
    )
    
    
    