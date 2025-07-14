from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from bson import ObjectId
from datetime import datetime
from core.database import get_db
from models.folder import Folder, FolderCreate, FolderUpdate
from schemas import FolderOut
from core.jwt import get_current_user
from models.user import UserInDB

router = APIRouter(prefix="/folders", tags=["folders"])


@router.post("/", response_model=FolderOut, status_code=status.HTTP_201_CREATED)
async def create_folder(
    folder_data: FolderCreate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Create a new folder"""
    try:
        print(f"Creating folder: {folder_data.name}, parent_id: {folder_data.parent_id}")
        print(f"Current user ID: {current_user.id}")
        
        # Convert parent_id string to ObjectId if provided
        parent_id = None
        if folder_data.parent_id and folder_data.parent_id != "none":
            try:
                parent_id = ObjectId(folder_data.parent_id)
                print(f"Looking for parent folder with ID: {parent_id}")
                
                # Verify parent folder exists and user has access
                parent_folder = db.folders.find_one({"_id": parent_id})
                if not parent_folder:
                    print(f"Parent folder not found: {parent_id}")
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Parent folder not found"
                    )
                
                parent_owner_id = str(parent_folder.get("owner_id"))
                current_user_id = str(current_user.id)
                print(f"Parent owner ID: {parent_owner_id}, Current user ID: {current_user_id}")
                
                if parent_owner_id != current_user_id:
                    print(f"Access denied: {parent_owner_id} != {current_user_id}")
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied to parent folder"
                    )
            except Exception as e:
                if isinstance(e, HTTPException):
                    raise
                print(f"Error processing parent_id: {e}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid parent folder ID format"
                )

        # Check if folder with same name already exists in the same parent
        existing_folder = db.folders.find_one({
            "name": folder_data.name,
            "parent_id": parent_id,
            "owner_id": current_user.id
        })
        
        if existing_folder:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A folder with this name already exists in this location"
            )

        # Create folder document
        folder_dict = {
            "name": folder_data.name,
            "parent_id": parent_id,
            "owner_id": current_user.id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        print(f"Creating folder with data: {folder_dict}")
        result = db.folders.insert_one(folder_dict)
        
        # Get the created folder
        created_folder = db.folders.find_one({"_id": result.inserted_id})
        
        # Convert ObjectId to string for response
        created_folder["id"] = str(created_folder["_id"])
        created_folder["owner_id"] = str(created_folder["owner_id"])
        if created_folder.get("parent_id"):
            created_folder["parent_id"] = str(created_folder["parent_id"])
        
        return FolderOut(**created_folder)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in create_folder: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create folder: {str(e)}"
        )


@router.get("/", response_model=List[FolderOut])
async def get_folders(
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Get all folders for the current user"""
    try:
        # Get folders owned by user
        folders = list(db.folders.find({
            "owner_id": current_user.id
        }).sort("name", 1))
        
        # Convert ObjectIds to strings and add missing timestamps
        for folder in folders:
            folder["id"] = str(folder["_id"])
            folder["owner_id"] = str(folder["owner_id"])
            if folder.get("parent_id"):
                folder["parent_id"] = str(folder["parent_id"])
            
            # Add default timestamps if missing (for existing folders)
            if "created_at" not in folder:
                folder["created_at"] = datetime.utcnow()
            if "updated_at" not in folder:
                folder["updated_at"] = folder.get("created_at", datetime.utcnow())
        
        return [FolderOut(**folder) for folder in folders]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve folders: {str(e)}"
        )


@router.get("/{folder_id}", response_model=FolderOut)
async def get_folder(
    folder_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Get a specific folder by ID"""
    try:
        # Validate ObjectId format
        try:
            obj_id = ObjectId(folder_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid folder ID format"
            )
        
        folder = db.folders.find_one({"_id": obj_id})
        
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Folder not found"
            )
        
        # Check if user owns this folder
        if str(folder.get("owner_id")) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Convert ObjectIds to strings
        folder["id"] = str(folder["_id"])
        folder["owner_id"] = str(folder["owner_id"])
        if folder.get("parent_id"):
            folder["parent_id"] = str(folder["parent_id"])
        
        # Add default timestamps if missing (for existing folders)
        if "created_at" not in folder:
            folder["created_at"] = datetime.utcnow()
        if "updated_at" not in folder:
            folder["updated_at"] = folder.get("created_at", datetime.utcnow())
        
        return FolderOut(**folder)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve folder: {str(e)}"
        )


@router.put("/{folder_id}", response_model=FolderOut)
async def update_folder(
    folder_id: str,
    folder_data: FolderUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Update a folder"""
    try:
        # Validate ObjectId format
        try:
            obj_id = ObjectId(folder_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid folder ID format"
            )
        
        # Check if folder exists and user owns it
        folder = db.folders.find_one({"_id": obj_id})
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Folder not found"
            )
        
        if str(folder.get("owner_id")) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Prepare update data
        update_data = {}
        if folder_data.name is not None:
            update_data["name"] = folder_data.name
        if folder_data.parent_id is not None:
            if folder_data.parent_id:
                try:
                    parent_obj_id = ObjectId(folder_data.parent_id)
                    # Verify parent folder exists and user has access
                    parent_folder = db.folders.find_one({"_id": parent_obj_id})
                    if not parent_folder:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail="Parent folder not found"
                        )
                    if str(parent_folder.get("owner_id")) != str(current_user.id):
                        raise HTTPException(
                            status_code=status.HTTP_403_FORBIDDEN,
                            detail="Access denied to parent folder"
                        )
                    update_data["parent_id"] = parent_obj_id
                except Exception as e:
                    if isinstance(e, HTTPException):
                        raise
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid parent folder ID format"
                    )
            else:
                update_data["parent_id"] = None
        
        update_data["updated_at"] = datetime.utcnow()
        
        # Update folder
        result = db.folders.update_one(
            {"_id": obj_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update folder"
            )
        
        # Get updated folder
        updated_folder = db.folders.find_one({"_id": obj_id})
        updated_folder["id"] = str(updated_folder["_id"])
        updated_folder["owner_id"] = str(updated_folder["owner_id"])
        if updated_folder.get("parent_id"):
            updated_folder["parent_id"] = str(updated_folder["parent_id"])
        
        return FolderOut(**updated_folder)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update folder: {str(e)}"
        )


@router.delete("/{folder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_folder(
    folder_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db = Depends(get_db("CollabraDoc"))
):
    """Delete a folder"""
    try:
        # Validate ObjectId format
        try:
            obj_id = ObjectId(folder_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid folder ID format"
            )
        
        # Check if folder exists and user owns it
        folder = db.folders.find_one({"_id": obj_id})
        if not folder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Folder not found"
            )
        
        if str(folder.get("owner_id")) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Check if folder has subfolders
        subfolders = db.folders.find_one({"parent_id": obj_id})
        if subfolders:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete folder with subfolders. Please delete subfolders first."
            )
        
        # Check if folder has documents
        documents = db.documents.find_one({"folder_id": obj_id})
        if documents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete folder with documents. Please move or delete documents first."
            )
        
        # Delete folder
        result = db.folders.delete_one({"_id": obj_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete folder"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete folder: {str(e)}"
        ) 