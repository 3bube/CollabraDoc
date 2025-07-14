from pydantic import BaseModel, Field, field_validator
from typing import Optional
from bson import ObjectId
from core.database import PyObjectId


class UserInDB(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    email: str
    password: str
    full_name: Optional[str] = None

    @field_validator('id', mode='before')
    @classmethod
    def validate_id(cls, v):
        if v is None:
            return v
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            return v
        raise ValueError('Invalid ObjectId')

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
