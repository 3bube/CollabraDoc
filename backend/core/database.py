from pymongo import MongoClient
from fastapi import Depends
from core.settings import settings

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
