from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserOut(BaseModel):
    id: str = Field(..., description="MongoDB ObjectId as string")
    email: EmailStr
    full_name: Optional[str] = None


class DocumentOut(BaseModel):
    id: str
    title: str
    content: str
    folder_id: Optional[str]
    isPublic: bool