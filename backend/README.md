# Backend - AI-Assisted Clinical Research System

## Overview

This is the Python/FastAPI backend for the AI-Assisted Clinical Research System. It provides RESTful APIs for document management, EDC automation, AI processing, and human-in-the-loop review workflows.

## Technology Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15+ with SQLAlchemy ORM
- **Caching**: Redis
- **AI/ML**: OpenAI API, Anthropic Claude
- **Task Queue**: Celery (for background jobs)
- **Authentication**: JWT tokens
- **Validation**: Pydantic

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 15+
- Redis 7+
- Virtual environment tool (venv, virtualenv, or conda)

## Installation

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

Create a `.env` file in the backend directory:

```env
# Environment
ENVIRONMENT=development
DEBUG=True

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinical_research

# Redis
REDIS_URL=redis://localhost:6379/0

# AI APIs (Optional - system works without them)
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
AI_MODEL=gpt-4

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=52428800

# Feature Flags
ENABLE_AI_PROCESSING=True
ENABLE_AUTO_APPROVAL=False
ENABLE_EMAIL_NOTIFICATIONS=False

# SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
```

### 4. Initialize Database

```bash
# Create database
createdb clinical_research

# Run migrations (if using Alembic)
alembic upgrade head

# Or initialize tables directly
python -c "from database import init_db; init_db()"
```

### 5. Create Initial Data (Optional)

```bash
python scripts/seed_data.py
```

## Running the Application

### Development Server

```bash
# Start the FastAPI server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/api/docs
- Alternative docs: http://localhost:8000/api/redoc

### Production Server

```bash
# Using Gunicorn with Uvicorn workers
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

### Background Workers (Celery)

```bash
# Start Celery worker
celery -A tasks.celery_app worker --loglevel=info

# Start Celery beat (for scheduled tasks)
celery -A tasks.celery_app beat --loglevel=info
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration settings
├── database.py            # Database models and session
├── auth.py                # Authentication logic
├── ai_service.py          # AI/ML service layer
├── requirements.txt       # Python dependencies
├── README.md             # This file
│
├── routers/              # API route handlers
│   ├── __init__.py
│   ├── documents.py      # Document management endpoints
│   ├── edc.py           # EDC endpoints
│   ├── reviews.py       # Review queue endpoints
│   ├── analytics.py     # Analytics endpoints
│   └── ai_processing.py # AI processing endpoints
│
├── services/            # Business logic layer
│   ├── __init__.py
│   ├── document_service.py
│   ├── edc_service.py
│   ├── review_service.py
│   └── validation_service.py
│
├── models/              # Pydantic models for validation
│   ├── __init__.py
│   ├── document.py
│   ├── edc.py
│   ├── review.py
│   └── user.py
│
├── utils/               # Utility functions
│   ├── __init__.py
│   ├── file_utils.py
│   ├── ocr_utils.py
│   ├── pdf_utils.py
│   └── validation_utils.py
│
├── tasks/               # Celery background tasks
│   ├── __init__.py
│   ├── celery_app.py
│   ├── document_tasks.py
│   └── notification_tasks.py
│
├── migrations/          # Alembic database migrations
│   ├── versions/
│   └── env.py
│
└── tests/               # Test suite
    ├── __init__.py
    ├── test_documents.py
    ├── test_edc.py
    ├── test_reviews.py
    └── test_ai_service.py
```

## API Endpoints

### Document Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/documents/upload` | Upload a document |
| GET | `/api/v1/documents` | List documents |
| GET | `/api/v1/documents/{id}` | Get document details |
| GET | `/api/v1/documents/{id}/download` | Download document |
| PUT | `/api/v1/documents/{id}/status` | Update document status |
| DELETE | `/api/v1/documents/{id}` | Delete document |

### EDC (Electronic Data Capture)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/edc/forms` | List EDC forms |
| GET | `/api/v1/edc/forms/{id}` | Get form template |
| POST | `/api/v1/edc/entries` | Create EDC entry |
| GET | `/api/v1/edc/entries` | List EDC entries |
| GET | `/api/v1/edc/entries/{id}` | Get EDC entry |
| PUT | `/api/v1/edc/entries/{id}` | Update EDC entry |
| POST | `/api/v1/edc/entries/{id}/submit` | Submit EDC entry |

### Review Queue

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reviews/queue` | Get pending reviews |
| GET | `/api/v1/reviews/{id}` | Get review details |
| POST | `/api/v1/reviews/{id}/approve` | Approve review |
| POST | `/api/v1/reviews/{id}/reject` | Reject review |
| POST | `/api/v1/reviews/{id}/modify` | Modify and approve |

### AI Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/extract` | Extract data from document |
| POST | `/api/v1/ai/validate` | Validate data |
| POST | `/api/v1/ai/classify` | Classify document |
| GET | `/api/v1/ai/jobs/{id}` | Get AI job status |
| POST | `/api/v1/ai/feedback` | Submit feedback |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/dashboard` | Dashboard statistics |
| GET | `/api/v1/analytics/performance` | Performance metrics |
| GET | `/api/v1/analytics/audit` | Audit trail data |

## Database Schema

### Key Tables

- **users**: User accounts and authentication
- **documents**: Uploaded clinical documents
- **edc_forms**: EDC form templates
- **edc_entries**: EDC data entries
- **reviews**: Review queue items
- **audit_logs**: Audit trail for compliance
- **ai_jobs**: AI processing job tracking

## AI Integration

### Supported Providers

1. **OpenAI GPT-4**: Best for complex extraction and validation
2. **Anthropic Claude**: Alternative high-quality option
3. **Local Models**: Can be configured for on-premise deployment

### AI Features

- Document classification
- Text and data extraction
- Data validation
- Anomaly detection
- Priority scoring
- Field mapping

### Confidence Thresholds

```python
HIGH_CONFIDENCE: 0.95+  # Auto-approve
MEDIUM_CONFIDENCE: 0.80-0.95  # Auto-fill with review
LOW_CONFIDENCE: < 0.80  # Require human review
```

## Security

### Authentication

The system uses JWT token-based authentication:

```python
# Example: Get access token
POST /api/v1/auth/login
{
  "username": "user@example.com",
  "password": "password"
}

# Response
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800
}

# Use token in requests
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| Admin | Full system access |
| Principal Investigator | Study data access |
| Clinical Research Coordinator | Data entry, review |
| Data Manager | Data validation, export |
| Auditor | Read-only access to audit logs |
| AI Reviewer | Review queue only |

## Testing

### Run Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/test_documents.py

# Run with verbose output
pytest -v
```

### Test Coverage

Aim for 80%+ code coverage:

```bash
pytest --cov=. --cov-report=term-missing
```

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

```bash
# Build image
docker build -t clinical-research-api .

# Run container
docker run -p 8000:8000 --env-file .env clinical-research-api
```

### Docker Compose

See `docker-compose.yml` for full stack deployment.

### Kubernetes

See `k8s/` directory for Kubernetes manifests.

## Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

### Metrics

The application exposes Prometheus metrics at `/metrics`.

### Logging

Logs are written to:
- Console (stdout/stderr)
- File: `./logs/app.log`
- Optionally to external services (Datadog, CloudWatch, etc.)

## Performance

### Optimization Tips

1. Use database connection pooling
2. Enable Redis caching for frequent queries
3. Use background tasks for heavy processing
4. Implement pagination for large datasets
5. Use database indexes on frequently queried fields

### Scaling

- Horizontal: Add more API server instances behind load balancer
- Vertical: Increase resources (CPU, memory) per instance
- Database: Use read replicas for read-heavy workloads
- Caching: Distributed Redis cluster

## Troubleshooting

### Common Issues

**Database connection errors**
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d clinical_research
```

**Redis connection errors**
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

**AI API errors**
```bash
# Check API keys are set
echo $OPENAI_API_KEY

# Test API connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## Contributing

1. Follow PEP 8 style guide
2. Write tests for new features
3. Update documentation
4. Run linting: `flake8 .`
5. Format code: `black .`
6. Check types: `mypy .`

## License

See LICENSE file in the root directory.

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-org/clinical-research-system/issues
- Email: support@yourcompany.com
- Documentation: https://docs.yourcompany.com

---

**Last Updated**: January 1, 2026
**Version**: 1.0.0
