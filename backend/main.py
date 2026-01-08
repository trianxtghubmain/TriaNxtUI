"""
FastAPI Backend for AI-Assisted Clinical Research System

This is the main entry point for the backend API.
Handles all HTTP requests and routes them to appropriate handlers.
"""

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from typing import List, Optional
import logging

from .routers import documents, edc, reviews, analytics, ai_processing
from .database import engine, Base, get_db
from .config import settings
from .auth import verify_token

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown"""
    # Startup
    logger.info("Starting up application...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    yield
    # Shutdown
    logger.info("Shutting down application...")

# Initialize FastAPI application
app = FastAPI(
    title="AI-Assisted Clinical Research System",
    description="Backend API for clinical document review, EDC automation, and AI validation",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(
    documents.router,
    prefix="/api/v1/documents",
    tags=["documents"],
    dependencies=[Depends(security)]
)

app.include_router(
    edc.router,
    prefix="/api/v1/edc",
    tags=["edc"],
    dependencies=[Depends(security)]
)

app.include_router(
    reviews.router,
    prefix="/api/v1/reviews",
    tags=["reviews"],
    dependencies=[Depends(security)]
)

app.include_router(
    analytics.router,
    prefix="/api/v1/analytics",
    tags=["analytics"],
    dependencies=[Depends(security)]
)

app.include_router(
    ai_processing.router,
    prefix="/api/v1/ai",
    tags=["ai"],
    dependencies=[Depends(security)]
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI-Assisted Clinical Research System API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/health"
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP Exception: {exc.detail}")
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return {
        "error": "Internal server error",
        "status_code": 500
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
