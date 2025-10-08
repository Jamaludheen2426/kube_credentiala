# Kube Credential - Microservices Assignment

**Submitted by:** Jamal Udheen  
**Email:** jamal2426@example.com  
**Contact Number:** +XX XXXXXXXXXX  
**Date:** January 8, 2025

---

## 🚀 Live Deployment URLs

- **Frontend (React App):** https://kube-credentiala-2.onrender.com/
- **Issuance Service API:** https://kube-credentiala.onrender.com
- **Verification Service API:** https://kube-credentiala-1.onrender.com

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Design Decisions](#design-decisions)
4. [Project Structure](#project-structure)
5. [Technology Stack](#technology-stack)
6. [Features](#features)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Docker Deployment](#docker-deployment)
10. [Testing](#testing)
11. [Assumptions](#assumptions)
12. [Local Development](#local-development)

---

## 🎯 Overview

**Kube Credential** is a microservices-based credential issuance and verification system. The application consists of two independent backend microservices and a React frontend, all deployed on Render's free tier.

### Key Features:
- ✅ Independent microservices for Issuance and Verification
- ✅ Worker identification for scalability tracking
- ✅ Duplicate credential detection
- ✅ Cross-service verification using internal APIs
- ✅ RESTful API design with proper error handling
- ✅ Responsive React frontend with TypeScript
- ✅ In-memory persistence with filesystem fallback
- ✅ Full CORS support for cross-origin requests

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│              https://kube-credentiala-2.onrender.com         │
└────────────────┬───────────────────┬────────────────────────┘
                 │                   │
                 │ POST /issue       │ POST /verify
                 ▼                   ▼
    ┌────────────────────┐  ┌────────────────────────┐
    │  Issuance Service  │  │ Verification Service   │
    │    (Port 3001)     │  │     (Port 3002)        │
    │  Node.js + TS      │  │   Node.js + TS         │
    └────────┬───────────┘  └───────┬────────────────┘
             │                      │
             │                      │ GET /internal/issued/:id
             │                      │
             └──────────────────────┘
                   Internal API
```

### Microservices Communication Flow

1. **Issuance Flow:**
   - User submits credential JSON via frontend
   - Frontend sends POST request to Issuance Service
   - Service computes SHA-256 hash of canonical JSON
   - Checks for existing credential in storage
   - If new: Issues credential, stores with worker ID and timestamp
   - Returns: `{credentialId, issuedAt, issuedBy, message}`

2. **Verification Flow:**
   - User submits credential JSON via frontend
   - Frontend sends POST request to Verification Service
   - Service computes SHA-256 hash of credential
   - Makes internal API call to Issuance Service
   - Checks if credential was issued
   - Logs verification attempt with worker ID
   - Returns: `{valid, credentialId, issuedAt, issuedBy, verifiedBy, verifiedAt}`

---

## 🎨 Design Decisions

### 1. **Microservices Architecture**
- **Decision:** Separate services for Issuance and Verification
- **Rationale:** Allows independent scaling, deployment, and maintenance. Each service has a single responsibility.

### 2. **Credential Identification**
- **Decision:** SHA-256 hash of canonical JSON representation
- **Rationale:** 
  - Ensures same credential always produces same ID
  - Order-independent (canonical JSON)
  - Cryptographically secure
  - Enables duplicate detection

### 3. **Storage Strategy**
- **Decision:** In-memory storage with filesystem fallback
- **Rationale:**
  - Render's free tier has ephemeral filesystem
  - In-memory storage prevents crashes when filesystem is read-only
  - Falls back to filesystem when available (local development)
  - Simple persistence without database setup

### 4. **Worker Identification**
- **Decision:** Environment variable `WORKER_ID` with fallback pattern
- **Rationale:**
  - Kubernetes can inject pod name as environment variable
  - Default pattern for development/testing
  - Fulfills "worker-n" requirement

### 5. **Internal API Communication**
- **Decision:** HTTP-based internal API for verification service to query issuance service
- **Rationale:**
  - RESTful and service-mesh compatible
  - Easy to test and debug
  - Works across different deployment environments

### 6. **Error Handling**
- **Decision:** Structured error responses with specific error codes
- **Rationale:**
  - Frontend can provide specific user feedback
  - Easier debugging and monitoring
  - RESTful best practices

### 7. **CORS Configuration**
- **Decision:** Permissive CORS for development/demo
- **Rationale:**
  - Allows frontend on different domain to access APIs
  - Can be restricted in production deployment

---

## 📁 Project Structure

```
kube_credentiala/
├── backend/
│   ├── issuance-service/
│   │   ├── src/
│   │   │   ├── config/env.ts
│   │   │   ├── controllers/issuanceController.ts
│   │   │   ├── middleware/
│   │   │   ├── models/types.ts
│   │   │   ├── repositories/issuanceRepo.ts
│   │   │   ├── routes/issuanceRoutes.ts
│   │   │   ├── services/issuanceService.ts
│   │   │   ├── utils/ (canonical.ts, hash.ts, worker.ts)
│   │   │   ├── logger/index.ts
│   │   │   ├── app.ts
│   │   │   └── index.ts
│   │   ├── tests/issue.test.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── verification-service/
│       ├── src/ (similar structure)
│       ├── tests/verify.test.ts
│       ├── Dockerfile
│       ├── package.json
│       └── tsconfig.json
│
├── frontend/
│   └── web/
│       ├── src/
│       │   ├── pages/ (Issue.tsx, Verify.tsx)
│       │   ├── api.ts
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       └── vite.config.ts
│
├── docker-compose.yml
└── README.md
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 20.x
- **Language:** TypeScript 5.6
- **Framework:** Express.js 4.19
- **Logging:** Winston 3.11
- **Validation:** Zod 3.23
- **Testing:** Vitest 2.0

### Frontend
- **Framework:** React 18.3
- **Language:** TypeScript 5.5
- **Build Tool:** Vite 5.4

### DevOps
- **Cloud Platform:** Render (Free Tier)
- **CI/CD:** GitHub + Render Auto-Deploy
- **Containerization:** Docker
- **Container Orchestration:** Docker Compose

---

## ✨ Features

### Issuance Service
- ✅ Issue new credentials with unique ID
- ✅ Detect and handle duplicate credentials
- ✅ Worker identification in responses
- ✅ Timestamp tracking (ISO 8601)
- ✅ SHA-256 based credential ID generation
- ✅ JSON schema validation
- ✅ Health check endpoint
- ✅ Structured logging

### Verification Service
- ✅ Verify credential against issuance records
- ✅ Cross-service internal API communication
- ✅ Verification logging with worker ID
- ✅ Detailed validation responses
- ✅ Handle non-issued credentials gracefully
- ✅ Health check endpoint

### Frontend
- ✅ Tab-based navigation (Issue/Verify)
- ✅ JSON text editor with validation
- ✅ Real-time error feedback
- ✅ Formatted JSON response display
- ✅ Loading states
- ✅ Responsive design

---

## 📡 API Documentation

### Issuance Service

#### POST /issue
Issue a new credential

**Request:**
```json
{
  "name": "Alice",
  "role": "admin"
}
```

**Response (201):**
```json
{
  "message": "credential issued by worker-1",
  "credentialId": "f890b09ba65ece1afe93ff829f60ed5145d9407440796b802bd1a215495f670f",
  "issuedAt": "2025-01-08T16:30:45.123Z",
  "issuedBy": "worker-1"
}
```

#### GET /healthz
Health check endpoint

**Response (200):**
```json
{
  "ok": true
}
```

### Verification Service

#### POST /verify
Verify a credential

**Request:**
```json
{
  "name": "Alice",
  "role": "admin"
}
```

**Response (200) - Valid:**
```json
{
  "valid": true,
  "credentialId": "f890b09ba65ece1afe93ff829f60ed5145d9407440796b802bd1a215495f670f",
  "issuedAt": "2025-01-08T16:30:45.123Z",
  "issuedBy": "worker-1",
  "verifiedBy": "verification-worker-1",
  "verifiedAt": "2025-01-08T16:35:12.456Z"
}
```

**Response (404) - Invalid:**
```json
{
  "valid": false,
  "reason": "not_issued"
}
```

---

## 🚀 Deployment

### Current Setup (Render)

**Issuance Service:**
- Build: `npm install && npm run build`
- Start: `npm start`
- Environment:
  - `WORKER_ID=worker-1`
  - `ISSUANCE_BASE_URL` (not needed)

**Verification Service:**
- Build: `npm install && npm run build`
- Start: `npm start`
- Environment:
  - `WORKER_ID=verification-worker-1`
  - `ISSUANCE_BASE_URL=https://kube-credentiala.onrender.com`

**Frontend:**
- Build: `npm install && npm run build`
- Publish: `dist/`
- Environment:
  - `VITE_ISSUANCE_API_URL=https://kube-credentiala.onrender.com`
  - `VITE_VERIFICATION_API_URL=https://kube-credentiala-1.onrender.com`

---

## 🧪 Testing

### Running Tests

**Issuance Service:**
```bash
cd backend/issuance-service
npm test
```

**Verification Service:**
```bash
cd backend/verification-service
npm test
```

### Test Coverage
- Unit tests for controllers
- Service layer tests
- Repository tests
- Error handling tests

---

## 📝 Assumptions

1. **Credential Format:** Any valid JSON object (no specific schema required)
2. **Worker IDs:** Environment variable based, defaults to "worker-n" pattern
3. **Persistence:** In-memory acceptable for demo (data loss on restart)
4. **Security:** CORS permissive, no authentication (demo purposes)
5. **Scalability:** Each service independently scalable
6. **Timestamps:** ISO 8601 format in UTC
7. **Internal API:** HTTP-based communication between services

---

## 💻 Local Development

### Prerequisites
- Node.js 20.x
- npm or yarn
- Git

### Setup

**1. Clone repository**
```bash
git clone https://github.com/Jamaludheen2426/kube_credentiala.git
cd kube_credentiala
```

**2. Start Issuance Service**
```bash
cd backend/issuance-service
npm install
npm run dev  # Port 3001
```

**3. Start Verification Service**
```bash
cd backend/verification-service
npm install
export ISSUANCE_BASE_URL=http://localhost:3001
npm run dev  # Port 3002
```

**4. Start Frontend**
```bash
cd frontend/web
npm install
npm run dev  # Port 5173
```

**5. Access:** http://localhost:5173

---

## 🐳 Docker Deployment

### Using Docker Compose

The easiest way to run the entire stack locally is using Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Building Individual Docker Images

**Issuance Service:**
```bash
cd backend/issuance-service
docker build -t issuance-service:latest .
docker run -p 3001:3001 \
  -e WORKER_ID=worker-1 \
  issuance-service:latest
```

**Verification Service:**
```bash
cd backend/verification-service
docker build -t verification-service:latest .
docker run -p 3002:3002 \
  -e WORKER_ID=verification-worker-1 \
  -e ISSUANCE_BASE_URL=http://issuance-service:3001 \
  verification-service:latest
```

### Docker Image Details

- Base Image: `node:20-alpine` (lightweight)
- Multi-stage builds for optimized size
- Health checks configured
- Volume mounts for data persistence
- Environment variables for configuration

---

## 📞 Contact Information

**Name:** Jamal Udheen  
**Email:** jamal2426@example.com  
**Phone:** +XX XXXXXXXXXX  
**GitHub:** https://github.com/Jamaludheen2426

---

## 🎓 Key Learnings

### Challenges & Solutions:
1. **ESM Module Resolution** → Added `.js` extensions to imports
2. **Ephemeral Filesystem** → Implemented in-memory fallback
3. **CORS Issues** → Configured proper CORS middleware
4. **TypeScript Build** → Moved types to dependencies

---

**Thank you for reviewing my submission!** 🙏
