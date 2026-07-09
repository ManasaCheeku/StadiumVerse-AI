import time
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from .agents import answer_agent, crowd_intelligence, emergency_response, operations_snapshot, shortest_route
from .database import Base, SessionLocal, engine, get_db
from .domain import AuditLog, Role, User
from .models import Venue, VenueInsights
from .schemas import (
    AgentRequest,
    AgentResponse,
    LoginRequest,
    NavigationRequest,
    RegisterRequest,
    RouteResponse,
    ScanRequest,
    ScanResponse,
    TicketCreate,
    TicketResponse,
    TokenResponse,
    UserResponse,
)
from .security import create_access_token, current_user, hash_password, require_roles, verify_password
from .seed import seed_database
from .services import build_insights, list_venues
from .ticketing import issue_ticket, validate_scan

@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="StadiumVerse AI API",
    version="1.0.0",
    description="AI-powered smart stadium operating system with RBAC, QR validation, navigation, security intelligence, and operations support.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_rate_hits: dict[str, list[float]] = {}


def initialize_database() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Database initialization failed: {e}")


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    key = request.client.host if request.client else "unknown"
    now = time.time()

    _rate_hits[key] = [
        hit for hit in _rate_hits.get(key, [])
        if now - hit < 60
    ]

    if len(_rate_hits[key]) > 120:
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded"},
        )

    _rate_hits[key].append(now)
    return await call_next(request)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/venues", response_model=list[Venue])
def venues() -> list[Venue]:
    return list_venues()


@app.get("/venues/{venue_id}/insights", response_model=VenueInsights)
def venue_insights(venue_id: str) -> VenueInsights:
    insights = build_insights(venue_id)
    if insights is None:
        raise HTTPException(status_code=404, detail="Venue not found")
    return insights


@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    if payload.role not in {role.value for role in Role}:
        raise HTTPException(status_code=400, detail="Unsupported role")
    if db.query(User).filter(User.email == payload.email.lower()).one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        role=payload.role,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.add(AuditLog(actor_email=user.email, action="register", detail=f"role={user.role}", risk_score=0))
    db.commit()
    return UserResponse(email=user.email, full_name=user.full_name, role=user.role)


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email.lower(), User.is_active.is_(True)).one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    db.add(AuditLog(actor_email=user.email, action="login", detail="successful login", risk_score=0))
    db.commit()
    return TokenResponse(access_token=create_access_token(user.email, user.role), role=user.role)


@app.get("/me", response_model=UserResponse)
def me(user: User = Depends(current_user)) -> UserResponse:
    return UserResponse(email=user.email, full_name=user.full_name, role=user.role)


@app.get("/schedule")
def schedule() -> list[dict]:
    return [
        {"match_id": "final-2026", "home": "Atlas United", "away": "Phoenix Comets", "stadium": "Atlas Dome", "kickoff": "2026-07-06T20:00:00+05:30"},
        {"match_id": "semi-2026", "home": "Harbor FC", "away": "Summit City", "stadium": "Harbor Field", "kickoff": "2026-07-10T19:30:00+05:30"},
    ]


@app.post("/tickets", response_model=TicketResponse)
def create_ticket(payload: TicketCreate, user: User = Depends(require_roles(Role.fan, Role.admin)), db: Session = Depends(get_db)) -> TicketResponse:
    ticket = issue_ticket(db, user, payload)
    return TicketResponse(ticket_code=ticket.ticket_code, qr_payload=ticket.qr_payload, gate=ticket.gate, seat=ticket.seat, stadium_id=ticket.stadium_id)


@app.post("/security/scan", response_model=ScanResponse)
def scan_ticket(payload: ScanRequest, user: User = Depends(require_roles(Role.security, Role.admin)), db: Session = Depends(get_db)) -> ScanResponse:
    return validate_scan(db, user, payload.qr_payload, payload.stadium_id, payload.match_id)


@app.post("/navigation/route", response_model=RouteResponse)
def navigation_route(payload: NavigationRequest, _: User = Depends(current_user)) -> RouteResponse:
    return shortest_route(payload)


@app.post("/ai/assist", response_model=AgentResponse)
def ai_assist(payload: AgentRequest, _: User = Depends(current_user)) -> AgentResponse:
    return answer_agent(payload)


@app.get("/operations/dashboard")
def operations_dashboard(_: User = Depends(require_roles(Role.manager, Role.admin, Role.security))) -> dict:
    return operations_snapshot()


@app.get("/operations/crowd")
def crowd_dashboard(_: User = Depends(require_roles(Role.manager, Role.admin, Role.security, Role.volunteer))) -> dict:
    return crowd_intelligence()


@app.get("/emergency/{incident_type}")
def emergency(incident_type: str, _: User = Depends(require_roles(Role.manager, Role.admin, Role.security, Role.volunteer))) -> dict:
    return emergency_response(incident_type)


@app.get("/parking")
def parking(_: User = Depends(current_user)) -> dict:
    return {"nearest": "Parking East", "available_slots": 248, "walking_minutes": 9, "prediction": "Accessible parking remains below 50% utilization."}


@app.get("/announcements")
def announcements(_: User = Depends(current_user)) -> list[dict]:
    return [
        {"language": "English", "message": "Gate 5 has the shortest queue for final arrivals."},
        {"language": "Hindi", "message": "Gate 5 par sabse kam line hai."},
        {"language": "Arabic", "message": "البوابة 5 لديها أقصر طابور الآن."},
    ]


@app.get("/admin/audit-logs")
def audit_logs(_: User = Depends(require_roles(Role.admin)), db: Session = Depends(get_db)) -> list[dict]:
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(50).all()
    return [
        {
            "actor": log.actor_email,
            "action": log.action,
            "detail": log.detail,
            "risk_score": log.risk_score,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]
