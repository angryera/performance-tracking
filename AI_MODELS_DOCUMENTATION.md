# AI Models Usage Documentation

This document provides a comprehensive overview of all AI models and LLM integrations across the Performance Tracking App and RAG Backend projects.

## 🏗️ Project Architecture Overview

### Performance Tracking App
- **Location:** Main application for sales performance tracking
- **AI Models:** OpenAI GPT-4 for transcript analysis
- **Integration:** VAPI assistants and Anam AI for real-time interactions

### RAG Backend
- **Location:** Separate project for RAG (Retrieval-Augmented Generation) functionality
- **AI Models:** Custom LLM models with vector database integration
- **Endpoints:** Custom LLM endpoints at `pbcheckitout.com/v1/` and `pbcheckitout.com/v2/`

---

## 🤖 OpenAI Models Usage

### 1. Transcript Analysis API
**File:** `src/app/api/analyze-transcript/route.ts`

**Purpose:** Analyzes sales conversation transcripts after chat/voice calls end to determine sales representative performance.

**Model:** GPT-4

**Configuration:**
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analysis = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
  temperature: 0.4,
  max_tokens: 2000,
});
```

**Workflow:**
1. Frontend sends transcript to backend after call completion
2. Backend loads company profiles (if available)
3. Sends structured prompt to OpenAI GPT-4
4. Returns performance grade (A-F) and analysis
5. Provides company matching recommendations

**Environment Variable:**
```env
OPENAI_API_KEY="your-openai-api-key"
```

---

## 🔧 Custom LLM Models (RAG Backend)

### 1. Custom LLM Endpoints
**Primary Endpoint:**
- `{{baseURL}}/v1/chat/completions` - Main API endpoint for all training modes

**API Versions:**
- `{{baseURL}}/v2/chat/completions` - Version 2 of the API (different version, same functionality)
- `{{baseURL}}/v3/chat/completions` - Version 3 of the API (different version, same functionality)

**Note:** `{{baseURL}}` represents the base domain (e.g., `pbcheckitout.com`)

**Features:**
- Pre-generated vector database integration
- User message prompt processing
- RAG (Retrieval-Augmented Generation) capabilities
- Single endpoint handles all modes: Training, Practice, and Rep Match

**Request Body Format:**
```json
{
    "messages": [{
        "role": "user",
        "content": "How are you doing"
    }],
    "stream": true
}
```

**Request Parameters:**
- `messages`: Array of message objects with `role` and `content`
- `role`: Can be "user", "assistant", or "system"
- `content`: The actual message text
- `stream`: Boolean for streaming responses (optional)

### 2. Vector Database Management
**File:** `rag_api.py`

**Vector DB Loading:**
```python
# Line 18 in rag_api.py
db = FAISS.load_local("vector_db", embedding, allow_dangerous_deserialization=True)
```

**Current Configuration:**
- **Path:** `vector_db` (relative path)
- **Technology:** FAISS vector database
- **Embedding:** Custom embedding model integration

### 3. Vector Database Updates
**File:** `ingest.py`

**Purpose:** Updates training content and regenerates vector databases

**Current Status:** 
- Needs modification to support different training contents
- Should create separate vector databases for different use cases

---

## 🎯 VAPI Assistants Integration

### 1. Configuration
**File:** `src/lib/config.ts`

```typescript
vapi: {
    publicKey: "a33bcaa3-fb93-472c-aaea-b3d3186e796d",
    assistants: {
        train: "f39e948b-f333-4a57-8ba8-6b01147f05db",
        practice: "33753ff6-b2dc-45d0-8f4d-12db7525c640",
        repmatch: "beb65fdb-aabc-4c5c-a3f5-63629e3ea094"
    }
}
```

### 2. Custom LLM Integration
**Features:**
- Uses custom LLM models with vector database
- Pre-generated vector DB for training content
- User message prompt processing
- RAG capabilities for enhanced responses

**Endpoints Used:**
- Primary: Custom LLM models at `{{baseURL}}/v1/chat/completions` (handles all modes)
- Alternative versions: `{{baseURL}}/v2/chat/completions` and `{{baseURL}}/v3/chat/completions` (same functionality, different API versions)

---

## 🎭 Anam AI Integration

### 1. Configuration
**File:** `src/lib/config.ts`

```typescript
anam: {
    apiKey: "ZjVlZjhmOGQtNWMxYi00ODMxLTg3ZDQtZDYxNWExN2NkZjBiOnE2S0hVeGVWeEdDVGpESFhVNHkwS0Zia1MwRENkc0MxYURNdWFNU3RrT3M9",
    apiUrl: "https://api.anam.ai/v1/auth/session-token",
    persona: {
        name: "Agent",
        llmId: "939de489-1b11-4b91-94b1-0e37223721ca",
        avatarId: "195d733e-58a9-40bb-a049-ac344fa70b7f",
        voiceId: "1c6fa8a7-9aa4-4a17-a75e-3e5eb863fccf",
        systemPrompt: `Your job is to role play as a potential customer...`
    }
}
```

### 2. LLM Model
**Model ID:** `939de489-1b11-4b91-94b1-0e37223721ca`

**Purpose:** Video-based customer roleplay for sales training

---

## 📊 Data Flow Architecture

### 1. Training Mode Flow
```
User Input → VAPI Assistant → Custom LLM ({{baseURL}}/v1/chat/completions) → Vector DB → Response
```

### 2. Practice Mode Flow
```
User Input → VAPI Assistant → Custom LLM ({{baseURL}}/v1/chat/completions) → Vector DB → Response
```

### 3. Rep Match Mode Flow
```
User Input → VAPI Assistant → Custom LLM ({{baseURL}}/v1/chat/completions) → Vector DB → Response
```

### 3. Transcript Analysis Flow
```
Call End → Frontend → Backend → OpenAI GPT-4 → Performance Analysis → Grade & Feedback
```

---

## 🔄 Update and Configuration Procedures

### 1. Updating Vector Database Paths
**File:** `rag_api.py`

**Current:**
```python
db = FAISS.load_local("vector_db", embedding, allow_dangerous_deserialization=True)
```

**To Update:**
```python
# For different use cases
db = FAISS.load_local("vector_db_training", embedding, allow_dangerous_deserialization=True)
db = FAISS.load_local("vector_db_practice", embedding, allow_dangerous_deserialization=True)
db = FAISS.load_local("vector_db_repmatch", embedding, allow_dangerous_deserialization=True)
```

### 2. Updating Training Content
**File:** `ingest.py`

**Modifications Needed:**
- Support for different training content sources
- Creation of separate vector databases
- Configuration for different use cases

**Example Structure:**
```python
# Training content for different modes
training_content = {
    "train": "path/to/training/materials",
    "practice": "path/to/practice/scenarios", 
    "repmatch": "path/to/company/profiles"
}

# Generate separate vector DBs
for mode, content_path in training_content.items():
    generate_vector_db(content_path, f"vector_db_{mode}")
```

### 3. Updating Custom LLM Endpoints
**Configuration Files:** Update VAPI and Anam AI configurations

**Current Endpoints:**
- `{{baseURL}}/v1/chat/completions` - Main endpoint for all modes (Training, Practice, Rep Match)

**API Versioning:**
- `{{baseURL}}/v2/chat/completions` - Version 2 of the same API
- `{{baseURL}}/v3/chat/completions` - Version 3 of the same API

**Note:** All training modes use the same endpoint with different vector databases and prompts to distinguish between Training, Practice, and Rep Match functionality.

---

## 🧪 Testing and Validation

### 1. OpenAI Integration Testing
```bash
# Test transcript analysis
curl -X POST http://localhost:3000/api/analyze-transcript \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Sample sales conversation..."}'
```

### 2. Custom LLM Testing
```bash
# Test custom LLM endpoints
curl -X POST {{baseURL}}/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
        "role": "user",
        "content": "How are you doing"
    }],
    "stream": true
}'

# Test alternative API versions (same functionality)
curl -X POST {{baseURL}}/v2/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
        "role": "user",
        "content": "What sales techniques should I use?"
    }],
    "stream": true
}'

curl -X POST {{baseURL}}/v3/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
        "role": "user",
        "content": "Help me find company matches"
    }],
    "stream": true
}'
```

### 3. Vector Database Testing
```python
# Test vector DB loading
from rag_api import load_vector_db
db = load_vector_db("vector_db_training")
# Verify database content and responses
```

---

## 📁 File Structure Summary

### Performance Tracking App
```
src/
├── app/api/analyze-transcript/route.ts  # OpenAI GPT-4 integration
├── lib/config.ts                        # VAPI & Anam AI configuration
└── components/CallWidget/               # Frontend integration
```

### RAG Backend
```
rag-backend/
├── rag_api.py                           # Vector DB loading & custom LLM
├── ingest.py                            # Training content & vector DB generation
└── vector_db/                           # Pre-generated vector databases
```

---

## 🔧 Configuration Checklist

### OpenAI Models
- [ ] `OPENAI_API_KEY` in `.env.local`
- [ ] GPT-4 model configuration in `analyze-transcript/route.ts`
- [ ] Temperature and max_tokens settings
- [ ] Prompt engineering for sales analysis

### Custom LLM Models
- [ ] Vector database paths in `rag_api.py`
- [ ] Training content sources in `ingest.py`
- [ ] Custom LLM endpoint configurations
- [ ] VAPI assistant integrations

### Vector Databases
- [ ] Separate DBs for different training modes
- [ ] Content ingestion pipeline
- [ ] Database update procedures
- [ ] Performance optimization

---

## 🚀 Future Enhancements

### 1. Model Versioning
- Support for multiple OpenAI model versions
- A/B testing different custom LLM configurations
- Gradual rollout of model updates

### 2. Performance Monitoring
- Token usage tracking
- Response time monitoring
- Quality metrics for different models
- Cost optimization

### 3. Content Management
- Automated training content updates
- Vector database versioning
- Content quality validation
- Multi-language support

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Projects:** Performance Tracking App + RAG Backend
**Maintainer:** Development Team

For questions or updates, refer to the main README.md files in each project or contact the development team. 