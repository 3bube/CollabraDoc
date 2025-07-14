from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from bson import ObjectId
from datetime import datetime
from core.database import get_db
from models.comment import Comment, CommentCreate, CommentUpdate, CommentOut
from schemas import ErrorResponse
from core.jwt import get_current_user
from models.user import UserInDB

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("/", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_data: CommentCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Create a new comment"""
    try:
        # Validate document_id
        try:
            document_id = ObjectId(comment_data.document_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID format"
            )

        # Check if document exists and user has access
        document = db.documents.find_one({"_id": document_id})
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

        # Validate parent_id if provided
        parent_id = None
        if comment_data.parent_id:
            try:
                parent_id = ObjectId(comment_data.parent_id)
                # Check if parent comment exists
                parent_comment = db.comments.find_one({"_id": parent_id})
                if not parent_comment:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Parent comment not found"
                    )
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid parent comment ID format"
                )

        # Create comment
        comment_dict = {
            "document_id": document_id,
            "content": comment_data.content,
            "author": {
                "id": str(current_user.id),
                "name": current_user.full_name or current_user.email,
                "email": current_user.email,
                "avatar": current_user.avatar
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "replies": [],
            "resolved": False,
            "selection": comment_data.selection.dict() if comment_data.selection else None,
            "position": comment_data.position,
            "parent_id": parent_id
        }

        result = db.comments.insert_one(comment_dict)
        
        # Get the created comment
        created_comment = db.comments.find_one({"_id": result.inserted_id})
        
        # Convert ObjectIds to strings
        created_comment["id"] = str(created_comment["_id"])
        created_comment["document_id"] = str(created_comment["document_id"])
        if created_comment.get("parent_id"):
            created_comment["parent_id"] = str(created_comment["parent_id"])

        return CommentOut(**created_comment)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create comment: {str(e)}"
        )

@router.get("/document/{document_id}", response_model=List[CommentOut])
async def get_document_comments(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Get all comments for a document"""
    try:
        # Validate document_id
        try:
            obj_id = ObjectId(document_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document ID format"
            )

        # Check if document exists and user has access
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

        # Get all comments for the document (only top-level comments)
        comments = list(db.comments.find({
            "document_id": obj_id,
            "parent_id": None
        }).sort("created_at", -1))

        # Convert ObjectIds to strings and get replies
        for comment in comments:
            comment["id"] = str(comment["_id"])
            comment["document_id"] = str(comment["document_id"])
            if comment.get("parent_id"):
                comment["parent_id"] = str(comment["parent_id"])

            # Get replies for this comment
            replies = list(db.comments.find({
                "parent_id": comment["_id"]
            }).sort("created_at", 1))

            for reply in replies:
                reply["id"] = str(reply["_id"])
                reply["document_id"] = str(reply["document_id"])
                if reply.get("parent_id"):
                    reply["parent_id"] = str(reply["parent_id"])

            comment["replies"] = replies

        return [CommentOut(**comment) for comment in comments]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve comments: {str(e)}"
        )

@router.get("/{comment_id}", response_model=CommentOut)
async def get_comment(
    comment_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Get a specific comment by ID"""
    try:
        # Validate comment_id
        try:
            obj_id = ObjectId(comment_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid comment ID format"
            )

        comment = db.comments.find_one({"_id": obj_id})
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )

        # Check if user has access to the document
        document = db.documents.find_one({"_id": comment["document_id"]})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        if not document.get("isPublic") and str(document.get("owner_id")) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        # Convert ObjectIds to strings
        comment["id"] = str(comment["_id"])
        comment["document_id"] = str(comment["document_id"])
        if comment.get("parent_id"):
            comment["parent_id"] = str(comment["parent_id"])

        # Get replies
        replies = list(db.comments.find({
            "parent_id": comment["_id"]
        }).sort("created_at", 1))

        for reply in replies:
            reply["id"] = str(reply["_id"])
            reply["document_id"] = str(reply["document_id"])
            if reply.get("parent_id"):
                reply["parent_id"] = str(reply["parent_id"])

        comment["replies"] = replies

        return CommentOut(**comment)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve comment: {str(e)}"
        )

@router.put("/{comment_id}", response_model=CommentOut)
async def update_comment(
    comment_id: str,
    comment_data: CommentUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Update a comment"""
    try:
        # Validate comment_id
        try:
            obj_id = ObjectId(comment_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid comment ID format"
            )

        # Check if comment exists
        comment = db.comments.find_one({"_id": obj_id})
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )

        # Check if user owns the comment
        if str(comment.get("author", {}).get("id")) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        # Prepare update data
        update_data = {"updated_at": datetime.utcnow()}
        if comment_data.content is not None:
            update_data["content"] = comment_data.content
        if comment_data.resolved is not None:
            update_data["resolved"] = comment_data.resolved

        # Update comment
        result = db.comments.update_one(
            {"_id": obj_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update comment"
            )

        # Get updated comment
        updated_comment = db.comments.find_one({"_id": obj_id})
        updated_comment["id"] = str(updated_comment["_id"])
        updated_comment["document_id"] = str(updated_comment["document_id"])
        if updated_comment.get("parent_id"):
            updated_comment["parent_id"] = str(updated_comment["parent_id"])

        # Get replies
        replies = list(db.comments.find({
            "parent_id": updated_comment["_id"]
        }).sort("created_at", 1))

        for reply in replies:
            reply["id"] = str(reply["_id"])
            reply["document_id"] = str(reply["document_id"])
            if reply.get("parent_id"):
                reply["parent_id"] = str(reply["parent_id"])

        updated_comment["replies"] = replies

        return CommentOut(**updated_comment)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update comment: {str(e)}"
        )

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Delete a comment"""
    try:
        # Validate comment_id
        try:
            obj_id = ObjectId(comment_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid comment ID format"
            )

        # Check if comment exists
        comment = db.comments.find_one({"_id": obj_id})
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )

        # Check if user owns the comment or is document owner
        document = db.documents.find_one({"_id": comment["document_id"]})
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )

        is_comment_owner = str(comment.get("author", {}).get("id")) == str(current_user.id)
        is_document_owner = str(document.get("owner_id")) == str(current_user.id)

        if not is_comment_owner and not is_document_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        # Delete comment and all its replies
        result = db.comments.delete_many({
            "$or": [
                {"_id": obj_id},
                {"parent_id": obj_id}
            ]
        })

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete comment"
            )

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete comment: {str(e)}"
        ) 