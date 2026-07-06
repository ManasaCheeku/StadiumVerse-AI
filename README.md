# StadiumVerse AI

StadiumVerse AI is a full-stack smart stadium operating system for international sporting venues. It combines secure ticket workflows, role-based dashboards, QR validation, indoor navigation, simulated crowd intelligence, emergency response playbooks, multilingual fan assistance, and operational decision support.

## Problem Statement

Large stadiums need coordinated support for fans, volunteers, security teams, and command center managers. Static maps and generic chatbots do not solve duplicate ticket scans, gate congestion, emergency routing, accessibility needs, or multilingual fan guidance. StadiumVerse AI provides a platform foundation where each persona has a focused workflow and AI-generated recommendations are derived from stadium context.

## Architecture

- `frontend`: React, Vite, React Router, Axios, Recharts, Leaflet dependency, Tailwind tooling, responsive CSS.
- `backend`: FastAPI, SQLAlchemy, SQLite, Pydantic, bcrypt password hashing, signed JWT-style tokens, RBAC, audit logging.
- `backend/app/agents.py`: deterministic multi-agent simulation for fan, navigation, crowd, food, volunteer, language, and emergency workflows.
- `backend/app/ticketing.py`: signed QR payload generation, stadium/match validation, duplicate scan detection, fraud handling.
- `backend/tests`: Pytest coverage for API, auth, authorization, QR validation, navigation, emergency, AI, and audit workflows.

## Features

- Persona dashboards for Fan, Security Officer, Volunteer, Stadium Operations Manager, and Administrator.
- Secure registration/login with bcrypt password hashing and bearer tokens.
- Role-Based Access Control for security, operations, volunteer, and admin endpoints.
- Encrypted/signed QR ticket payloads with duplicate scan and fraud detection.
- Indoor routing with accessibility notes for wheelchair users and other mobility needs.
- Operations dashboard with crowd density, gate occupancy, queue prediction, parking utilization, food congestion, incidents, medical alerts, and AI recommendations.
- Emergency response generator for medical, fire, stampede, power outage, and lost child scenarios.
- Multilingual announcement and assistant workflow placeholders for English, Hindi, Kannada, Tamil, Telugu, Arabic, French, and Spanish.
- Audit logging and rate limiting.

## Demo Accounts

All demo accounts use `Password123!`.

- `fan@stadiumverse.ai`
- `security@stadiumverse.ai`
- `volunteer@stadiumverse.ai`
- `manager@stadiumverse.ai`
- `admin@stadiumverse.ai`

## Installation

Backend:

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev -- --port 5173
```

Open `http://127.0.0.1:5173`.

## Environment Variables

Backend:

- `DATABASE_URL`: defaults to `sqlite:///./stadiumverse.db`
- `JWT_SECRET`: required for production; use a long random secret

Frontend:

- `VITE_API_BASE_URL`: optional deployment-time API URL

## API Highlights

- `POST /auth/register`
- `POST /auth/login`
- `GET /me`
- `POST /tickets`
- `POST /security/scan`
- `POST /navigation/route`
- `POST /ai/assist`
- `GET /operations/dashboard`
- `GET /emergency/{incident_type}`
- `GET /admin/audit-logs`

Interactive API docs are available at `http://127.0.0.1:8000/docs` when the backend is running.

## Testing

```bash
cd backend
python -m pytest
```

The current suite covers authentication, authorization, QR validation, duplicate scan detection, crowd operations, navigation, emergency services, AI assistance, and audit logs.

## Deployment

- Frontend: Vercel using `vercel.json`
- Backend: Render using `render.yaml`
- Set `JWT_SECRET` in production.
- Replace SQLite with managed PostgreSQL for multi-instance production deployments.

## Future Enhancements

- Real OpenAI-compatible LLM provider adapter with prompt/version tracing.
- Real Leaflet indoor map tiles and beacon-based wayfinding.
- Camera/IoT ingestion pipeline for live crowd analytics.
- Payment provider and official ticketing portal integration.
- WebSocket announcements and incident push notifications.
- Expanded WCAG testing with automated accessibility checks.

## License

MIT
