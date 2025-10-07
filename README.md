# Kube Credential (Dockerized)

This repository contains a microservice-based credential issuance and verification system using JSON file persistence (no DB) and Docker.

Structure
- backend/
  - issuance-service (Node.js + TS, Express)
  - verification-service (Node.js + TS, Express)
- frontend/
  - web (React + TS, Vite)
- docker-compose.yml

Assumptions
- JSON files are used for simple persistence. On some free-tier hosts (like Render), filesystem may reset on redeploy/restart.
- Verification calls Issuance via HTTP to confirm issuance. Verification logs are also stored in a JSON file.
- Worker ID is derived from WORKER_ID env var or the container hostname and returned in responses as worker-n.

APIs
- Issuance: POST /issue
  - Body: any JSON object (credential)
  - Responses:
    - 201: { message: "credential issued by worker-n", credentialId, issuedAt, issuedBy }
    - 200: { message: "credential already issued", credentialId, issuedAt, issuedBy }
  - Internal: GET /internal/issued/:credentialId
- Verification: POST /verify
  - Body: same JSON credential object
  - Responses:
    - 200: { valid: true, credentialId, issuedAt, issuedBy, verifiedBy, verifiedAt }
    - 404: { valid: false, reason: "not_issued" }

Run locally with Docker
- Requirements: Docker Desktop
- In PowerShell:
  - cd "C:\Users\jamal2426\Desktop\development assesment"
  - docker compose up --build
- Services:
  - Issuance API: http://localhost:3001/issue
  - Verification API: http://localhost:3002/verify
  - Frontend (static): http://localhost:8080
    - Frontend build-time envs are set in docker-compose.yml via build args.

Run locally without Docker (optional)
- Install Node 20+
- Start issuance:
  - $env:PORT=3001; $env:DATA_FILE="./data/credentials.json"; npm install --prefix ./backend/issuance-service; npm run dev --prefix ./backend/issuance-service
- Start verification:
  - $env:PORT=3002; $env:DATA_FILE="./data/verifications.json"; $env:ISSUANCE_BASE_URL="http://localhost:3001"; npm install --prefix ./backend/verification-service; npm run dev --prefix ./backend/verification-service
- Start frontend:
  - npm install --prefix ./frontend/web; npm run dev --prefix ./frontend/web

Tests
- Backend:
  - npm test --prefix ./backend/issuance-service
  - npm test --prefix ./backend/verification-service
- Frontend:
  - npm test --prefix ./frontend/web

Deployment (Render)
- Create two Web Services from backend services (Node runtime), set env variables accordingly.
- Create a Static Site for frontend/web and set VITE_ISSUANCE_API_URL, VITE_VERIFICATION_API_URL.

Notes
- Kubernetes manifests were intentionally removed per requirement; this project is dockerized with Docker Compose.
- For production or scaling >1 replica, replace JSON files with a shared DB or shared volume.
