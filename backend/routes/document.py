from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List
from bson import ObjectId
from datetime import datetime
from core.database import get_db
from models.document import Document, DocumentCreate, DocumentUpdate
from schemas import DocumentOut, ErrorResponse
from core.jwt import get_current_user
from models.user import UserInDB

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def create_document(
    document_data: DocumentCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Create a new document"""
    try:
        # Convert folder_id string to ObjectId if provided
        folder_id = None
        if document_data.folder_id:
            try:
                folder_id = ObjectId(document_data.folder_id)
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid folder ID format"
                )

        # Create document document
        document_dict = {
            "title": document_data.title,
            "content": document_data.content,
            "folder_id": folder_id,
            "isPublic": document_data.isPublic,
            "owner_id": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = db.documents.insert_one(document_dict)
        
        # Get the created document
        created_document = db.documents.find_one({"_id": result.inserted_id})
        
        # Convert ObjectId to string for response
        created_document["id"] = str(created_document["_id"])
        created_document["owner_id"] = str(created_document["owner_id"])
        if created_document.get("folder_id"):
            created_document["folder_id"] = str(created_document["folder_id"])
        
        return DocumentOut(**created_document)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create document: {str(e)}"
        )


@router.get("/", response_model=List[DocumentOut])
async def get_documents(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Get all documents for the current user"""
    try:
        # Get documents owned by user or public documents
        documents = list(db.documents.find({
            "$or": [
                {"owner_id": current_user.id},
                {"isPublic": True}
            ]
        }).sort("updated_at", -1))
        
        # Convert ObjectIds to strings
        for doc in documents:
            doc["id"] = str(doc["_id"])
            doc["owner_id"] = str(doc["owner_id"])
            if doc.get("folder_id"):
                doc["folder_id"] = str(doc["folder_id"])
            
            # Add default timestamps if missing (for existing documents)
            if "created_at" not in doc:
                doc["created_at"] = datetime.utcnow()
            if "updated_at" not in doc:
                doc["updated_at"] = doc.get("created_at", datetime.utcnow())
        
        return [DocumentOut(**doc) for doc in documents]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve documents: {str(e)}"
        )


@router.get("/search", response_model=List[DocumentOut])
async def search_documents(
    q: str = Query(..., description="Search query"),
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Search documents by title or content (case-insensitive, partial match)"""
    try:
        documents = list(db.documents.find({
            "$and": [
                {"$or": [
                    {"owner_id": current_user.id},
                    {"isPublic": True}
                ]},
                {"$or": [
                    {"title": {"$regex": q, "$options": "i"}},
                    {"content": {"$regex": q, "$options": "i"}}
                ]}
            ]
        }).sort("updated_at", -1))
        for doc in documents:
            doc["id"] = str(doc["_id"])
            doc["owner_id"] = str(doc["owner_id"])
            if doc.get("folder_id"):
                doc["folder_id"] = str(doc["folder_id"])
            if "created_at" not in doc:
                doc["created_at"] = datetime.utcnow()
            if "updated_at" not in doc:
                doc["updated_at"] = doc.get("created_at", datetime.utcnow())
        return [DocumentOut(**doc) for doc in documents]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search documents: {str(e)}"
        )


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Get a specific document by ID"""
    try:
        # Validate ObjectId format
        try:
            obj_id = ObjectId(document_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID format"
            )
        
        document = db.documents.find_one({"_id": obj_id})
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user has access to this document
        if not document.get("isPublic") and str(document.get("owner_id")) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Convert ObjectIds to strings
        document["id"] = str(document["_id"])
        document["owner_id"] = str(document["owner_id"])
        if document.get("folder_id"):
            document["folder_id"] = str(document["folder_id"])
        
        # Add default timestamps if missing (for existing documents)
        if "created_at" not in document:
            document["created_at"] = datetime.utcnow()
        if "updated_at" not in document:
            document["updated_at"] = document.get("created_at", datetime.utcnow())
        
        return DocumentOut(**document)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve document: {str(e)}"
        )


@router.put("/{document_id}", response_model=DocumentOut)
async def update_document(
    document_id: str,
    document_data: DocumentUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Update a document"""
    try:
        # Validate ObjectId format
        try:
            obj_id = ObjectId(document_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID format"
            )
        
        # Check if document exists and user owns it
        document = db.documents.find_one({"_id": obj_id})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if str(document.get("owner_id")) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Prepare update data
        update_data = {}
        if document_data.title is not None:
            update_data["title"] = document_data.title
        if document_data.content is not None:
            update_data["content"] = document_data.content
        if document_data.isPublic is not None:
            update_data["isPublic"] = document_data.isPublic
        if document_data.folder_id is not None:
            if document_data.folder_id:
                try:
                    update_data["folder_id"] = ObjectId(document_data.folder_id)
                except Exception:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid folder ID format"
                    )
            else:
                update_data["folder_id"] = None
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update document
        result = db.documents.update_one(
            {"_id": obj_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update document"
            )
        
        # Get updated document
        updated_document = db.documents.find_one({"_id": obj_id})
        updated_document["id"] = str(updated_document["_id"])
        updated_document["owner_id"] = str(updated_document["owner_id"])
        if updated_document.get("folder_id"):
            updated_document["folder_id"] = str(updated_document["folder_id"])
        
        return DocumentOut(**updated_document)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update document: {str(e)}"
        )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Delete a document"""
    try:
        # Validate ObjectId format
        try:
            obj_id = ObjectId(document_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID format"
            )
        
        # Check if document exists and user owns it
        document = db.documents.find_one({"_id": obj_id})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if str(document.get("owner_id")) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Delete document
        result = db.documents.delete_one({"_id": obj_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete document"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )
