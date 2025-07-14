from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
from core.database import PyObjectId


class Document(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    title: str
    content: str = ""
    folder_id: Optional[PyObjectId] = None
    isPublic: bool = False
    owner_id: PyObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class DocumentCreate(BaseModel):
    title: str
    folder_id: Optional[str] = None
    isPublic: bool = False
    content: str = ""


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    folder_id: Optional[str] = None
    isPublic: Optional[bool] = None
