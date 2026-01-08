"""
Document Management Router

Handles document upload, processing, and retrieval
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
from datetime import datetime

from ..database import get_db, Document, DocumentStatus
from ..config import settings
from ..ai_service import ai_service

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    study_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """Upload a clinical document"""
    
    # Validate file type
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not allowed")
    
    # Validate file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail=f"File size exceeds maximum of {settings.MAX_UPLOAD_SIZE} bytes")
    
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(settings.UPLOAD_DIR, f"{timestamp}_{file.filename}")
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create database record
    document = Document(
        filename=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=file_size,
        study_id=study_id,
        patient_id=patient_id,
        status=DocumentStatus.UPLOADED
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    # Schedule background processing
    if background_tasks and settings.ENABLE_AI_PROCESSING:
        background_tasks.add_task(process_document, document.id, db)
    
    return {
        "id": document.id,
        "filename": document.filename,
        "status": document.status,
        "created_at": document.created_at
    }

@router.get("/{document_id}")
async def get_document(document_id: int, db: Session = Depends(get_db)):
    """Get document details"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {
        "id": document.id,
        "filename": document.filename,
        "file_type": document.file_type,
        "file_size": document.file_size,
        "document_type": document.document_type,
        "status": document.status,
        "study_id": document.study_id,
        "patient_id": document.patient_id,
        "extracted_data": document.extracted_data,
        "ai_confidence": document.ai_confidence,
        "created_at": document.created_at,
        "processed_at": document.processed_at
    }

@router.get("/")
async def list_documents(
    skip: int = 0,
    limit: int = 20,
    study_id: Optional[str] = None,
    status: Optional[DocumentStatus] = None,
    db: Session = Depends(get_db)
):
    """List documents with pagination and filtering"""
    
    query = db.query(Document)
    
    if study_id:
        query = query.filter(Document.study_id == study_id)
    
    if status:
        query = query.filter(Document.status == status)
    
    total = query.count()
    documents = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "documents": [
            {
                "id": doc.id,
                "filename": doc.filename,
                "document_type": doc.document_type,
                "status": doc.status,
                "ai_confidence": doc.ai_confidence,
                "created_at": doc.created_at
            }
            for doc in documents
        ]
    }

async def process_document(document_id: int, db: Session):
    """Background task to process document with AI"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        return
    
    try:
        # Update status
        document.status = DocumentStatus.PROCESSING
        db.commit()
        
        # Read document text (simplified - real implementation would use OCR/PDF parsing)
        with open(document.file_path, 'r', encoding='utf-8', errors='ignore') as f:
            document_text = f.read()
        
        # Classify document
        classification = await ai_service.classify_document(document_text)
        document.document_type = classification.get("document_type")
        
        # Extract fields
        extraction = await ai_service.extract_fields(
            document_text,
            document.document_type or "Unknown"
        )
        
        document.extracted_data = extraction.get("extracted_fields", {})
        document.ai_confidence = extraction.get("overall_confidence", 0.0)
        
        # Update status
        document.status = DocumentStatus.PROCESSED
        document.processed_at = datetime.utcnow()
        
        # Create review if confidence is low
        if document.ai_confidence < settings.REQUIRE_REVIEW_THRESHOLD:
            document.status = DocumentStatus.REVIEW_PENDING
        
        db.commit()
        
    except Exception as e:
        document.status = DocumentStatus.FAILED
        document.processing_errors = str(e)
        db.commit()
