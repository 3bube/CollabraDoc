from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from core.database import PyObjectId

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

class Comment(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    document_id: PyObjectId
    content: str
    author: CommentAuthor
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    replies: List['Comment'] = Field(default_factory=list)
    resolved: bool = False
    selection: Optional[TextSelection] = None
    position: Optional[dict] = None
    parent_id: Optional[PyObjectId] = None

    class Config:
        populate_by_name = True

class CommentCreate(BaseModel):
    content: str
    document_id: str
    parent_id: Optional[str] = None
    selection: Optional[TextSelection] = None
    position: Optional[dict] = None

class CommentUpdate(BaseModel):
    content: Optional[str] = None
    resolved: Optional[bool] = None

class CommentOut(BaseModel):
    id: str
    document_id: str
    content: str
    author: CommentAuthor
    created_at: datetime
    updated_at: datetime
    replies: List['CommentOut'] = Field(default_factory=list)
    resolved: bool
    selection: Optional[TextSelection] = None
    position: Optional[dict] = None
    parent_id: Optional[str] = None

    class Config:
        pass

# Update forward refs for recursive models
Comment.model_rebuild()
CommentOut.model_rebuild() 