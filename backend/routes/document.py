from fastapi import APIRouter, HTTPException, Depends, status
from core.database import get_db
from models import document
from schemas import DocumentOut

router =  APIRouter(prefix="/document", tags=["document"])

# get documents table

@router.post("/create-document",response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def create_document(data: document.DocumentCreate,  db = Depends(get_db("CollabraDoc"))):
    try:
        db_document = document.Document(**data.model_dump())
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        return db_document
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create document")
