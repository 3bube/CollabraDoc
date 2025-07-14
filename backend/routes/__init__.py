from fastapi import APIRouter
from .users import router as users_router
from .auth import router as auth_router
from .document import router as document_router
from .folder import router as folder_router
from .comments import router as comments_router

api_router = APIRouter()
api_router.include_router(users_router)
api_router.include_router(auth_router)
api_router.include_router(document_router)
api_router.include_router(folder_router)
api_router.include_router(comments_router)
