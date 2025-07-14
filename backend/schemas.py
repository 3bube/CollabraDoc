from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


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
    folder_id: Optional[str] = None
    isPublic: bool
    owner_id: str
    created_at: datetime
    updated_at: datetime


class DocumentCreate(BaseModel):
    title: str
    folder_id: Optional[str] = None
    isPublic: bool = False
    content: str = ""


class FolderOut(BaseModel):
    id: str
    name: str
    parent_id: Optional[str] = None
    owner_id: str
    created_at: datetime
    updated_at: datetime


class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[str] = None


class TextSelection(BaseModel):
    start: int
    end: int
    text: str
    element_id: Optional[str] = None


class CommentAuthor(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None


class CommentOut(BaseModel):
    id: str
    document_id: str
    content: str
    author: CommentAuthor
    created_at: datetime
    updated_at: datetime
    replies: List['CommentOut'] = []
    resolved: bool
    selection: Optional[TextSelection] = None
    position: Optional[dict] = None
    parent_id: Optional[str] = None


class CommentCreate(BaseModel):
    content: str
    document_id: str
    parent_id: Optional[str] = None
    selection: Optional[TextSelection] = None
    position: Optional[dict] = None


class CommentUpdate(BaseModel):
    content: Optional[str] = None
    resolved: Optional[bool] = None


class ErrorResponse(BaseModel):
    detail: str


class UserStatsOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[str] = 'viewer'
    status: Optional[str] = 'offline'