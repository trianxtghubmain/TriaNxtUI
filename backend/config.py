"""
Configuration settings for the backend application

Uses environment variables with sensible defaults for development.
For production, all sensitive values should be set via environment variables.
"""

import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # API Configuration
    API_VERSION: str = "v1"
    API_PREFIX: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "YOUR_SECRET_KEY_HERE_CHANGE_IN_PRODUCTION")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/clinical_research"
    )
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_FILE_TYPES: List[str] = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/tiff",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    
    # AI/ML Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY_HERE")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "YOUR_ANTHROPIC_API_KEY_HERE")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4")
    AI_TEMPERATURE: float = 0.1  # Low temperature for consistent outputs
    AI_MAX_TOKENS: int = 4000
    AI_TIMEOUT: int = 60  # seconds
    
    # AI Confidence Thresholds
    HIGH_CONFIDENCE_THRESHOLD: float = 0.95
    MEDIUM_CONFIDENCE_THRESHOLD: float = 0.80
    LOW_CONFIDENCE_THRESHOLD: float = 0.60
    
    # Review Queue
    AUTO_APPROVE_THRESHOLD: float = 0.98  # Auto-approve above this confidence
    REQUIRE_REVIEW_THRESHOLD: float = 0.80  # Require human review below this
    
    # Background Tasks
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/2")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "./logs/app.log")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Audit Trail
    AUDIT_LOG_RETENTION_DAYS: int = 2555  # 7 years
    
    # Email (for notifications)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@clinical-research.com")
    
    # Feature Flags
    ENABLE_AI_PROCESSING: bool = os.getenv("ENABLE_AI_PROCESSING", "True").lower() == "true"
    ENABLE_AUTO_APPROVAL: bool = os.getenv("ENABLE_AUTO_APPROVAL", "False").lower() == "true"
    ENABLE_EMAIL_NOTIFICATIONS: bool = os.getenv("ENABLE_EMAIL_NOTIFICATIONS", "False").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Validation
if settings.ENVIRONMENT == "production":
    if settings.SECRET_KEY == "YOUR_SECRET_KEY_HERE_CHANGE_IN_PRODUCTION":
        raise ValueError("SECRET_KEY must be set in production environment")
    if not settings.DEBUG == False:
        raise ValueError("DEBUG must be False in production environment")
