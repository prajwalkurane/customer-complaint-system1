# AI Customer Complaint Management

Production-oriented complaint management system with React/Redux Toolkit/Material UI, FastAPI/SQLAlchemy/MySQL/JWT, and a LangGraph + Groq enrichment workflow.

## Start

1. Copy `.env.example` to `.env`, set secure database/JWT values, and optionally add `GROQ_API_KEY`.
2. Run `docker compose up --build`.
3. Open http://localhost:5173 and register the first account.

API documentation is at http://localhost:8000/docs. Uploaded evidence is stored under `uploads/` (mount durable storage in production).

## Architecture

- `backend/app/api`: HTTP controllers; `core`: settings/security; `models`: persistence; `schemas`: contracts; `services`: OCR and AI use cases.
- `frontend/src`: feature-oriented Redux slices, API client, pages and reusable components.

```mermaid
flowchart LR
  UI[React + Material UI] --> RTK[Redux Toolkit slices]
  RTK --> API[FastAPI JWT API]
  API --> DB[(MySQL / SQLAlchemy)]
  API --> OCR[OCR extraction]
  OCR --> LG[LangGraph workflow]
  API --> LG
  LG --> G[Groq gemma2-9b-it]
  LG --> C[Summary · risk · RCA · CAPA · duplicate]
  API --> AUDIT[Audit log / timeline]
```

```mermaid
sequenceDiagram
  participant A as Agent
  participant W as Web app
  participant S as FastAPI
  participant AI as LangGraph / Groq
  participant D as MySQL
  A->>W: Create complaint + evidence
  W->>S: Authenticated request
  S->>S: OCR file evidence
  S->>AI: Analyze complaint
  AI-->>S: Summary, risk, RCA, CAPA
  S->>D: Store complaint and audit event
  S-->>W: Updated case and timeline
```

## Sample data and roles

On first startup, the API creates sample complaints and two development accounts: `admin@example.com` / `Admin123!` (admin) and `agent@example.com` / `Agent123!` (agent). Change/remove these seed credentials for production. Agents can create and update cases; only `admin` and `manager` roles can view the system audit feed or delete complaints.

## Production notes

Use a managed MySQL database, a secret manager for environment values, object storage/virus scanning for uploads, HTTPS, migrations (Alembic), rate limiting, and an authenticated reverse proxy. AI enrichment degrades to deterministic analysis when Groq credentials are absent.
