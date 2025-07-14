from pymongo import MongoClient
from fastapi import Depends
from core.settings import settings
from bson import ObjectId
from pydantic import GetJsonSchemaHandler, GetCoreSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import Annotated, Any

class PyObjectId(ObjectId):
    """Custom type for MongoDB ObjectId"""
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: GetCoreSchemaHandler,
    ) -> core_schema.CoreSchema:
        return core_schema.with_info_after_validator_function(
            cls._validate,
            core_schema.str_schema(),
            serialization=core_schema.str_schema(),
        )

    @classmethod
    def _validate(cls, v: Any, handler) -> ObjectId:
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId")
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")

    @classmethod
    def __get_pydantic_json_schema__(
        cls,
        _core_schema: core_schema.CoreSchema,
        _handler: GetJsonSchemaHandler,
    ) -> JsonSchemaValue:
        return {"type": "string", "format": "objectid"}

    def __repr__(self):
        return f"PyObjectId('{super().__repr__()}')"

client: MongoClient | None = None

def get_client() -> MongoClient:
    global client
    if client is None:
        client = MongoClient(settings.MONGODB_URL)
    return client

def get_db(db_name=None):
    def _get_db(client: MongoClient = Depends(get_client)):
        return client[db_name]
    return _get_db
