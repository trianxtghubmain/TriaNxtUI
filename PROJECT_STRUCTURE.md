# Project Structure

Complete directory structure and file organization for the AI-Assisted Clinical Research System.

## 📁 Root Directory

```
clinical-research-system/
├── README.md                    # Main project documentation
├── QUICKSTART.md               # Quick start guide
├── ARCHITECTURE.md             # System architecture documentation
├── COMPLIANCE.md               # Compliance and safety guidelines
├── AI_PROMPTS.md               # AI prompt templates
├── PROJECT_STRUCTURE.md        # This file
├── LICENSE                     # License information
├── .gitignore                  # Git ignore rules
├── .env.example                # Environment variables template
├── docker-compose.yml          # Docker compose configuration
├── Dockerfile.frontend         # Frontend Docker configuration
├── package.json                # Frontend dependencies
├── postcss.config.mjs          # PostCSS configuration
├── vite.config.ts              # Vite configuration
│
├── src/                        # Frontend source code
├── backend/                    # Backend source code
└── docs/                       # Additional documentation (optional)
```

## 🎨 Frontend Structure (`/src/`)

```
src/
├── app/
│   ├── App.tsx                 # Main application component
│   ├── types.ts                # TypeScript type definitions
│   ├── mockData.ts             # Mock data and API functions
│   │
│   ├── components/
│   │   ├── Dashboard.tsx       # Dashboard view component
│   │   ├── DocumentReview.tsx  # Document review module
│   │   ├── EDCAutomation.tsx   # EDC automation module
│   │   ├── ReviewQueue.tsx     # Review queue module
│   │   ├── AuditTrail.tsx      # Audit trail view
│   │   │
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── ...             # Other UI components
│   │   │
│   │   └── figma/              # Figma-specific components
│   │       └── ImageWithFallback.tsx
│   │
│   └── styles/
│       ├── index.css           # Main styles entry point
│       ├── tailwind.css        # Tailwind directives
│       ├── theme.css           # Theme configuration
│       └── fonts.css           # Font imports
│
└── imports/                    # Imported assets (if any)
```

### Key Frontend Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main application with routing and layout |
| `types.ts` | All TypeScript interfaces and types |
| `mockData.ts` | Demo data and mock API functions |
| `Dashboard.tsx` | System metrics and analytics |
| `DocumentReview.tsx` | Document upload and review interface |
| `EDCAutomation.tsx` | EDC form filling with AI assistance |
| `ReviewQueue.tsx` | Human-in-the-loop review workflow |
| `AuditTrail.tsx` | Compliance audit log viewer |

## 🔧 Backend Structure (`/backend/`)

```
backend/
├── README.md                   # Backend documentation
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Backend Docker configuration
├── .env.example                # Backend environment template
├── main.py                     # FastAPI application entry point
├── config.py                   # Configuration settings
├── database.py                 # Database models and ORM
├── auth.py                     # Authentication logic
├── ai_service.py               # AI/ML integration service
│
├── routers/                    # API route handlers
│   ├── __init__.py
│   ├── documents.py            # Document management endpoints
│   ├── edc.py                  # EDC endpoints
│   ├── reviews.py              # Review queue endpoints
│   ├── analytics.py            # Analytics endpoints
│   └── ai_processing.py        # AI processing endpoints
│
├── services/                   # Business logic layer
│   ├── __init__.py
│   ├── document_service.py     # Document processing logic
│   ├── edc_service.py          # EDC business logic
│   ├── review_service.py       # Review workflow logic
│   └── validation_service.py   # Data validation logic
│
├── models/                     # Pydantic models
│   ├── __init__.py
│   ├── document.py             # Document models
│   ├── edc.py                  # EDC models
│   ├── review.py               # Review models
│   └── user.py                 # User models
│
├── utils/                      # Utility functions
│   ├── __init__.py
│   ├── file_utils.py           # File handling utilities
│   ├── ocr_utils.py            # OCR processing
│   ├── pdf_utils.py            # PDF handling
│   └── validation_utils.py     # Validation helpers
│
├── tasks/                      # Celery background tasks
│   ├── __init__.py
│   ├── celery_app.py           # Celery configuration
│   ├── document_tasks.py       # Document processing tasks
│   └── notification_tasks.py   # Notification tasks
│
├── migrations/                 # Alembic database migrations
│   ├── versions/               # Migration versions
│   └── env.py                  # Alembic environment
│
├── tests/                      # Test suite
│   ├── __init__.py
│   ├── test_documents.py       # Document tests
│   ├── test_edc.py             # EDC tests
│   ├── test_reviews.py         # Review tests
│   └── test_ai_service.py      # AI service tests
│
├── scripts/                    # Utility scripts
│   ├── seed_data.py            # Database seeding
│   ├── init_db.py              # Database initialization
│   └── backup.py               # Backup utilities
│
├── uploads/                    # Uploaded files (gitignored)
└── logs/                       # Application logs (gitignored)
```

### Key Backend Files

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, middleware, route registration |
| `config.py` | Configuration from environment variables |
| `database.py` | SQLAlchemy models and database session |
| `auth.py` | JWT authentication and authorization |
| `ai_service.py` | AI integration for all ML operations |
| `routers/documents.py` | Document upload, processing, retrieval |
| `routers/edc.py` | EDC form and entry management |
| `routers/reviews.py` | Review queue and approval workflow |

## 📄 Documentation Files

```
/
├── README.md                   # Main project documentation
│   ├── Overview and features
│   ├── Architecture summary
│   ├── Technology stack
│   ├── Getting started
│   ├── Setup instructions
│   └── Deployment guide
│
├── QUICKSTART.md               # Quick start guide
│   ├── Docker setup
│   ├── Manual setup
│   ├── Using the system
│   ├── Demo data
│   └── Troubleshooting
│
├── ARCHITECTURE.md             # System architecture
│   ├── Architecture diagram
│   ├── Component details
│   ├── Data flow
│   ├── API endpoints
│   ├── Database schema
│   └── Deployment architecture
│
├── COMPLIANCE.md               # Compliance guidelines
│   ├── Regulatory frameworks (21 CFR Part 11, HIPAA, GDPR)
│   ├── Security best practices
│   ├── AI safety and ethics
│   ├── Data privacy
│   ├── Validation requirements
│   ├── Audit trail specifications
│   └── Compliance checklist
│
├── AI_PROMPTS.md               # AI prompt templates
│   ├── Document classification
│   ├── Data extraction
│   ├── Validation
│   ├── Anomaly detection
│   ├── Priority scoring
│   ├── Field mapping
│   └── Best practices
│
├── PROJECT_STRUCTURE.md        # This file
│   └── Complete directory structure
│
└── backend/README.md           # Backend documentation
    ├── Installation
    ├── API endpoints
    ├── Database schema
    ├── Testing
    └── Deployment
```

## 🔌 Configuration Files

```
/
├── package.json                # Frontend dependencies and scripts
├── vite.config.ts              # Vite build configuration
├── postcss.config.mjs          # PostCSS configuration
├── .env.example                # Environment variables template
├── docker-compose.yml          # Multi-container Docker setup
├── Dockerfile.frontend         # Frontend container
│
backend/
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Backend container
└── .env.example                # Backend environment template
```

## 🗄️ Data Storage

```
backend/
├── uploads/                    # Uploaded documents
│   ├── <timestamp>_<filename>
│   └── ...
│
├── logs/                       # Application logs
│   ├── app.log
│   ├── error.log
│   └── access.log
│
└── backups/                    # Database backups (optional)
    └── <date>_backup.sql
```

## 🧪 Test Structure

```
backend/tests/
├── __init__.py
├── conftest.py                 # Pytest configuration and fixtures
│
├── unit/                       # Unit tests
│   ├── test_models.py
│   ├── test_services.py
│   └── test_utils.py
│
├── integration/                # Integration tests
│   ├── test_api.py
│   ├── test_workflows.py
│   └── test_ai_integration.py
│
└── e2e/                        # End-to-end tests
    ├── test_document_flow.py
    ├── test_edc_flow.py
    └── test_review_flow.py
```

## 🚀 Build Outputs (Generated)

```
/
├── dist/                       # Frontend production build
│   ├── index.html
│   ├── assets/
│   └── ...
│
├── node_modules/               # Frontend dependencies
│
backend/
├── venv/                       # Python virtual environment
├── __pycache__/                # Python bytecode cache
└── .pytest_cache/              # Pytest cache
```

## 📋 Key File Relationships

### Frontend Data Flow
```
User → App.tsx → Component (Dashboard/Documents/EDC/Reviews/Audit)
                    ↓
                mockData.ts (Demo Mode)
                    ↓
                API calls (Production Mode)
                    ↓
                Backend API
```

### Backend Request Flow
```
Client Request → main.py → Router → Service → Database/AI
                                        ↓
                                   Response
```

### AI Processing Flow
```
Document Upload → routers/documents.py
                    ↓
                Background Task
                    ↓
                ai_service.py
                    ↓
                OpenAI/Anthropic API
                    ↓
                Database (results)
                    ↓
                Review Queue (if needed)
```

## 🔐 Security-Sensitive Files

**Never commit these files:**
```
.env                            # Environment variables with secrets
backend/.env                    # Backend environment variables
backend/uploads/*               # Uploaded documents
backend/logs/*                  # Log files
node_modules/                   # Dependencies
backend/venv/                   # Python virtual environment
dist/                           # Build outputs
```

## 📦 Deployment Structure

### Development
```
Local Machine
├── Frontend (Vite dev server)
├── Backend (Uvicorn)
├── PostgreSQL (local)
└── Redis (local)
```

### Docker Development
```
Docker Compose
├── frontend (container)
├── backend (container)
├── postgres (container)
├── redis (container)
└── celery-worker (container)
```

### Production
```
Cloud Infrastructure
├── CDN (Frontend static files)
├── Load Balancer
│   └── Backend (multiple instances)
├── Managed PostgreSQL
├── Managed Redis
├── Object Storage (S3)
└── Monitoring/Logging Service
```

## 🎯 File Naming Conventions

- **React Components**: PascalCase (e.g., `DocumentReview.tsx`)
- **Utilities**: camelCase (e.g., `mockData.ts`)
- **Python modules**: snake_case (e.g., `ai_service.py`)
- **Configuration**: lowercase (e.g., `vite.config.ts`)
- **Documentation**: UPPERCASE (e.g., `README.md`)

## 📝 Code Organization Principles

1. **Separation of Concerns**: UI, business logic, and data access are separated
2. **Modularity**: Each component/module has a single responsibility
3. **Reusability**: Common UI components in `/src/app/components/ui/`
4. **Scalability**: Services and routers can be extended independently
5. **Testability**: Clear separation enables easy unit testing

---

**Last Updated**: January 1, 2026  
**Version**: 1.0.0
