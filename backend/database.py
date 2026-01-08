"""
Database models and session management

This module defines the SQLAlchemy models and database session handling.
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Boolean, Text, JSON, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

from .config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Enums
class DocumentStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    REVIEW_PENDING = "review_pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FAILED = "failed"

class ReviewStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    MODIFIED = "modified"

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PI = "principal_investigator"
    CRC = "clinical_research_coordinator"
    DATA_MANAGER = "data_manager"
    AUDITOR = "auditor"
    AI_REVIEWER = "ai_reviewer"

# Models
class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    documents = relationship("Document", back_populates="uploader")
    reviews = relationship("Review", back_populates="reviewer")
    audit_logs = relationship("AuditLog", back_populates="user")

class Document(Base):
    """Document model"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)
    document_type = Column(String)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED)
    
    # Metadata
    study_id = Column(String, index=True)
    patient_id = Column(String, index=True)
    visit_date = Column(DateTime)
    
    # Processing results
    extracted_data = Column(JSON)
    ai_confidence = Column(Float)
    processing_errors = Column(Text)
    
    # Relationships
    uploader_id = Column(Integer, ForeignKey("users.id"))
    uploader = relationship("User", back_populates="documents")
    reviews = relationship("Review", back_populates="document")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = Column(DateTime)

class EDCForm(Base):
    """EDC Form template model"""
    __tablename__ = "edc_forms"
    
    id = Column(Integer, primary_key=True, index=True)
    form_name = Column(String, nullable=False)
    form_version = Column(String)
    study_id = Column(String, index=True)
    form_schema = Column(JSON, nullable=False)  # Form field definitions
    validation_rules = Column(JSON)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    entries = relationship("EDCEntry", back_populates="form")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class EDCEntry(Base):
    """EDC data entry model"""
    __tablename__ = "edc_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("edc_forms.id"), nullable=False)
    
    # Study identifiers
    study_id = Column(String, index=True)
    patient_id = Column(String, index=True)
    visit_id = Column(String)
    
    # Data
    entry_data = Column(JSON, nullable=False)
    validation_results = Column(JSON)
    completeness_score = Column(Float)
    
    # Source tracking
    source_document_id = Column(Integer, ForeignKey("documents.id"))
    source_document = relationship("Document")
    
    # AI assistance
    ai_assisted = Column(Boolean, default=False)
    ai_confidence = Column(Float)
    auto_filled_fields = Column(JSON)
    
    # Status
    status = Column(String, default="draft")
    submitted_at = Column(DateTime)
    submitted_by_id = Column(Integer, ForeignKey("users.id"))
    submitted_by = relationship("User")
    
    # Relationships
    form = relationship("EDCForm", back_populates="entries")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Review(Base):
    """Review queue item model"""
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # What's being reviewed
    review_type = Column(String, nullable=False)  # document, edc_entry, etc.
    document_id = Column(Integer, ForeignKey("documents.id"))
    edc_entry_id = Column(Integer, ForeignKey("edc_entries.id"))
    
    # Priority and routing
    priority_score = Column(Integer, default=50)
    priority_level = Column(String)  # CRITICAL, HIGH, MEDIUM, LOW
    
    # Assignment
    assigned_to_id = Column(Integer, ForeignKey("users.id"))
    assigned_at = Column(DateTime)
    
    # Review details
    status = Column(Enum(ReviewStatus), default=ReviewStatus.PENDING)
    ai_suggestions = Column(JSON)
    ai_confidence = Column(Float)
    reviewer_notes = Column(Text)
    decision = Column(String)
    decision_reason = Column(Text)
    
    # Relationships
    document = relationship("Document", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)

class AuditLog(Base):
    """Audit trail model for compliance"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Who, what, when
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)  # create, read, update, delete, approve, reject
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    
    # Details
    old_value = Column(JSON)
    new_value = Column(JSON)
    reason = Column(Text)
    
    # Context
    ip_address = Column(String)
    user_agent = Column(String)
    session_id = Column(String)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    
    # Timestamp
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class AIJob(Base):
    """AI processing job tracking"""
    __tablename__ = "ai_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_type = Column(String, nullable=False)  # extraction, validation, classification
    status = Column(String, default="queued")  # queued, processing, completed, failed
    
    # Input/Output
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_message = Column(Text)
    
    # Performance
    model_used = Column(String)
    tokens_used = Column(Integer)
    processing_time_ms = Column(Integer)
    confidence_score = Column(Float)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)

# Database session dependency
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create all tables
def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
