# Quick Start Guide

Get the AI-Assisted Clinical Research System up and running in minutes.

## 🚀 Fastest Start (Docker)

If you have Docker and Docker Compose installed:

```bash
# 1. Clone the repository
git clone <repository-url>
cd clinical-research-system

# 2. Create environment file
cp .env.example .env

# 3. (Optional) Add your AI API keys to .env
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...

# 4. Start all services
docker-compose up

# 5. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

That's it! The system is now running with:
- ✅ React frontend
- ✅ FastAPI backend
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ Celery worker

## 🔧 Manual Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Step 1: Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at http://localhost:5173

### Step 2: Backend Setup

```bash
# Create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Create database
createdb clinical_research

# Initialize database tables
python -c "from database import init_db; init_db()"

# Start backend server
uvicorn main:app --reload
```

Backend API will be available at http://localhost:8000

### Step 3: Start Redis

```bash
redis-server
```

## 🎮 Using the System

### 1. Dashboard
- View system statistics
- Monitor processing metrics
- See document distribution

### 2. Document Review
1. Click "Upload Document"
2. Select a PDF, image, or text file
3. (Optional) Enter Study ID and Patient ID
4. Click "Upload"
5. Watch AI process the document
6. Review extracted data

### 3. EDC Automation
1. Select an EDC form from the dropdown
2. Click "Load AI Suggestions" to auto-fill from documents
3. Review and modify suggested values
4. Click "Validate" to check for errors
5. Click "Save Entry" to submit

### 4. Review Queue
1. See pending reviews sorted by priority
2. Click on a review item
3. Review AI suggestions and confidence scores
4. View extracted data
5. Add notes and approve or reject

### 5. Audit Trail
- View all system activities
- Filter by action type
- Search by resource ID or type
- Track compliance

## 📝 Demo Data

The system comes with mock data for demonstration:
- 5 sample documents with various statuses
- 3 pending reviews
- 2 EDC form templates
- Dashboard statistics
- Audit log entries

## 🔑 API Keys (Optional)

The system works in demo mode without API keys. For full AI functionality:

1. Get an API key from:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/

2. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-...
   # or
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Restart backend server

## 🧪 Testing

### Frontend
```bash
npm run test
```

### Backend
```bash
cd backend
pytest
```

## 📊 System Health Check

Verify all services are running:

```bash
# Frontend
curl http://localhost:5173

# Backend
curl http://localhost:8000/health

# PostgreSQL
psql -h localhost -U postgres -d clinical_research -c "SELECT 1;"

# Redis
redis-cli ping
```

## 🐛 Troubleshooting

### Frontend not loading?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend connection error?
```bash
# Check PostgreSQL is running
pg_isctl status

# Check database exists
psql -l | grep clinical_research

# Check Redis is running
redis-cli ping
```

### Database connection failed?
```bash
# Verify DATABASE_URL in backend/.env
# Default: postgresql://postgres:postgres@localhost:5432/clinical_research

# Test connection
psql postgresql://postgres:postgres@localhost:5432/clinical_research
```

### Port already in use?
```bash
# Frontend (default 5173)
lsof -ti:5173 | xargs kill -9

# Backend (default 8000)
lsof -ti:8000 | xargs kill -9
```

## 📚 Next Steps

1. **Read the documentation**
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
   - [COMPLIANCE.md](./COMPLIANCE.md) - Regulatory compliance
   - [AI_PROMPTS.md](./AI_PROMPTS.md) - AI configuration

2. **Explore the code**
   - Frontend: `/src/app/`
   - Backend: `/backend/`
   - Components: `/src/app/components/`

3. **Customize for your needs**
   - Add new document types
   - Create custom EDC forms
   - Configure validation rules
   - Add new review workflows

4. **Deploy to production**
   - See deployment section in README.md
   - Review security checklist in COMPLIANCE.md
   - Perform system validation

## ⚠️ Important Reminders

- This is a DEMO system with mock data
- NOT validated for production clinical trials
- NOT for storing real patient data
- Requires validation before regulatory use
- Review compliance requirements

## 🆘 Getting Help

- Review README.md for detailed information
- Check documentation files
- Review API documentation at http://localhost:8000/api/docs
- File an issue on GitHub

## 🎯 Key Features to Try

1. **Upload a document** and watch AI extract data
2. **Create an EDC entry** with AI auto-fill
3. **Review pending items** in the review queue
4. **View the audit trail** for compliance tracking
5. **Explore the dashboard** for system metrics

Enjoy exploring the AI-Assisted Clinical Research System! 🚀

---

**Version**: 1.0.0  
**Last Updated**: January 1, 2026
