"""StadiumVerse AI API.

FastAPI application exposing a smart-stadium operating system: role-based
authentication, QR ticket issuance and validation, wayfinding/navigation,
AI-assisted Q&A, crowd and operations intelligence, emergency response
guidance, and administrative audit logging.

This module wires together the HTTP layer only; business logic lives in the
``agents``, ``services``, ``ticketing``, and ``security`` modules.
"""

import logging
import time
from collections.abc import AsyncIterator, Awaitable, Callable
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from starlette.responses import Response

from .agents import (
    answer_agent,
    crowd_intelligence,
    emergency_response,
    operations_snapshot,
    shortest_route,
)
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
from .security import (
    create_access_token,
    current_user,
    hash_password,
    require_roles,
    verify_password,
)
from .seed import seed_database
from .services import build_insights, list_venues
from .ticketing import issue_ticket, validate_scan

# --------------------------------------------------------------------------
# Configuration constants
# --------------------------------------------------------------------------

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 120

AUDIT_LOG_DEFAULT_LIMIT = 50

# Static demo content served by informational endpoints.
MATCH_SCHEDULE: list[dict] = [
    {
        "match_id": "final-2026",
        "home": "Atlas United",
        "away": "Phoenix Comets",
        "stadium": "Atlas Dome",
        "kickoff": "2026-07-06T20:00:00+05:30",
    },
    {
        "match_id": "semi-2026",
        "home": "Harbor FC",
        "away": "Summit City",
        "stadium": "Harbor Field",
        "kickoff": "2026-07-10T19:30:00+05:30",
    },
]

MULTILINGUAL_ANNOUNCEMENTS: list[dict] = [
    {"language": "English", "message": "Gate 5 has the shortest queue for final arrivals."},
    {"language": "Hindi", "message": "Gate 5 par sabse kam line hai."},
    {"language": "Arabic", "message": "البوابة 5 لديها أقصر طابور الآن."},
]

PARKING_STATUS: dict = {
    "nearest": "Parking East",
    "available_slots": 248,
    "walking_minutes": 9,
    "prediction": "Accessible parking remains below 50% utilization.",
}

# In-memory sliding-window rate limiter state: client host -> request timestamps.
_rate_hits: dict[str, list[float]] = {}

LOGGER = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Initialize the database schema and seed data on application startup."""
    initialize_database()
    yield


app = FastAPI(
    title="StadiumVerse AI API",
    version="1.0.0",
    description=(
        "AI-powered smart stadium operating system with RBAC, QR validation, "
        "navigation, security intelligence, and operations support."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def initialize_database() -> None:
    """Create all tables (if missing) and seed baseline demo data.

    Failures (e.g. an unreachable database or a seeding error) are logged
    rather than raised, so that a transient issue at startup does not
    prevent the application process from coming up. Subsequent requests
    that depend on the database will surface the underlying error through
    their own error handling.
    """
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except Exception:  # noqa: BLE001 - startup must not crash the process
        LOGGER.exception("Database initialization failed")


@app.middleware("http")
async def rate_limit(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    """Apply a simple per-client sliding-window rate limit.

    Each client (identified by remote host) is allowed at most
    ``RATE_LIMIT_MAX_REQUESTS`` requests per ``RATE_LIMIT_WINDOW_SECONDS``.
    Requests beyond that limit receive an HTTP 429 response.
    """
    client_key = request.client.host if request.client else "unknown"
    now = time.time()

    _rate_hits[client_key] = [
        hit for hit in _rate_hits.get(client_key, [])
        if now - hit < RATE_LIMIT_WINDOW_SECONDS
    ]

    if len(_rate_hits[client_key]) > RATE_LIMIT_MAX_REQUESTS:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded"},
        )

    _rate_hits[client_key].append(now)
    return await call_next(request)


@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    description="Returns the current health status of the StadiumVerse AI API.",
    response_description="API is running successfully.",
)
def health() -> dict[str, str]:
    """Report basic liveness of the service."""
    return {"status": "ok"}


@app.get(
    "/venues",
    response_model=list[Venue],
    tags=["Venues"],
    summary="List venues",
    description="Returns all venues known to the platform.",
    response_description="A list of venues.",
)
def venues() -> list[Venue]:
    """Return every registered venue."""
    return list_venues()


@app.get(
    "/venues/{venue_id}/insights",
    response_model=VenueInsights,
    tags=["Venues"],
    summary="Get venue insights",
    description="Returns AI-derived operational insights for a specific venue.",
    response_description="Insights for the requested venue.",
)
def venue_insights(venue_id: str) -> VenueInsights:
    """Return derived insights for a single venue, or 404 if it doesn't exist."""
    insights = build_insights(venue_id)
    if insights is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Venue not found")
    return insights


@app.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Authentication"],
    summary="Register a new user",
    description="Creates a new user account with the requested role.",
    response_description="The newly created user.",
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    """Register a new user account.

    Raises:
        HTTPException: 400 if the requested role is not supported, or 409 if
            the email address is already registered.
    """
    if payload.role not in {role.value for role in Role}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported role")
    if db.query(User).filter(User.email == payload.email.lower()).one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

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


@app.post(
    "/auth/login",
    response_model=TokenResponse,
    tags=["Authentication"],
    summary="Log in",
    description="Authenticates a user with email and password and returns an access token.",
    response_description="An access token bound to the user's role.",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Authenticate a user and issue a bearer token.

    Raises:
        HTTPException: 401 if the credentials are invalid or the account is
            inactive.
    """
    user = db.query(User).filter(User.email == payload.email.lower(), User.is_active.is_(True)).one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    db.add(AuditLog(actor_email=user.email, action="login", detail="successful login", risk_score=0))
    db.commit()
    return TokenResponse(access_token=create_access_token(user.email, user.role), role=user.role)


@app.get(
    "/me",
    response_model=UserResponse,
    tags=["Authentication"],
    summary="Get current user",
    description="Returns the profile of the currently authenticated user.",
    response_description="The authenticated user's profile.",
)
def me(user: User = Depends(current_user)) -> UserResponse:
    """Return the authenticated user's own profile."""
    return UserResponse(email=user.email, full_name=user.full_name, role=user.role)


@app.get(
    "/schedule",
    tags=["Venues"],
    summary="Get match schedule",
    description="Returns the upcoming match schedule across venues.",
    response_description="A list of scheduled matches.",
)
def schedule() -> list[dict]:
    """Return the static upcoming match schedule."""
    return MATCH_SCHEDULE


@app.post(
    "/tickets",
    response_model=TicketResponse,
    tags=["Ticketing"],
    summary="Issue a ticket",
    description="Issues a new QR-coded ticket for the authenticated fan.",
    response_description="The issued ticket, including its QR payload.",
)
def create_ticket(
    payload: TicketCreate,
    user: User = Depends(require_roles(Role.fan, Role.admin, Role.security)),
    db: Session = Depends(get_db),
) -> TicketResponse:
    """Issue a ticket for the requesting fan (or admin/security acting on their behalf)."""
    ticket = issue_ticket(db, user, payload)
    return TicketResponse(
        ticket_code=ticket.ticket_code,
        qr_payload=ticket.qr_payload,
        gate=ticket.gate,
        seat=ticket.seat,
        stadium_id=ticket.stadium_id,
    )


@app.post(
    "/security/scan",
    response_model=ScanResponse,
    tags=["Security"],
    summary="Scan a ticket",
    description="Validates a scanned QR ticket payload at a stadium gate.",
    response_description="The result of the scan validation.",
)
def scan_ticket(
    payload: ScanRequest,
    user: User = Depends(require_roles(Role.security, Role.admin)),
    db: Session = Depends(get_db),
) -> ScanResponse:
    """Validate a ticket QR payload for a given stadium and match."""
    return validate_scan(db, user, payload.qr_payload, payload.stadium_id, payload.match_id)


@app.post(
    "/navigation/route",
    response_model=RouteResponse,
    tags=["Navigation"],
    summary="Get shortest route",
    description="Computes the shortest in-venue route between two points.",
    response_description="The computed route.",
)
def navigation_route(payload: NavigationRequest, _: User = Depends(current_user)) -> RouteResponse:
    """Compute the shortest route for an authenticated user."""
    return shortest_route(payload)


@app.post(
    "/ai/assist",
    response_model=AgentResponse,
    tags=["AI"],
    summary="Ask the AI assistant",
    description="Sends a question to the AI assistant and returns its answer.",
    response_description="The assistant's response.",
)
def ai_assist(payload: AgentRequest, _: User = Depends(current_user)) -> AgentResponse:
    """Delegate a user question to the answer agent."""
    return answer_agent(payload)


@app.get(
    "/operations/dashboard",
    tags=["Operations"],
    summary="Get operations dashboard",
    description="Returns a snapshot of current stadium operations metrics.",
    response_description="Operations snapshot data.",
)
def operations_dashboard(_: User = Depends(require_roles(Role.manager, Role.admin, Role.security))) -> dict:
    """Return the current operations snapshot for staff roles."""
    return operations_snapshot()


@app.get(
    "/operations/crowd",
    tags=["Operations"],
    summary="Get crowd intelligence",
    description="Returns AI-derived crowd density and flow intelligence.",
    response_description="Crowd intelligence data.",
)
def crowd_dashboard(
    _: User = Depends(require_roles(Role.manager, Role.admin, Role.security, Role.volunteer)),
) -> dict:
    """Return crowd intelligence data for staff and volunteer roles."""
    return crowd_intelligence()


@app.get(
    "/emergency/{incident_type}",
    tags=["Operations"],
    summary="Get emergency response guidance",
    description="Returns recommended response guidance for a given incident type.",
    response_description="Emergency response guidance.",
)
def emergency(
    incident_type: str,
    _: User = Depends(require_roles(Role.manager, Role.admin, Role.security, Role.volunteer)),
) -> dict:
    """Return response guidance for the given incident type."""
    return emergency_response(incident_type)


@app.get(
    "/parking",
    tags=["Venues"],
    summary="Get parking status",
    description="Returns nearest parking availability and utilization prediction.",
    response_description="Current parking status.",
)
def parking(_: User = Depends(current_user)) -> dict:
    """Return current parking availability for authenticated users."""
    return PARKING_STATUS


@app.get(
    "/announcements",
    tags=["Venues"],
    summary="Get announcements",
    description="Returns current stadium announcements in multiple languages.",
    response_description="A list of multilingual announcements.",
)
def announcements(_: User = Depends(current_user)) -> list[dict]:
    """Return current announcements translated into supported languages."""
    return MULTILINGUAL_ANNOUNCEMENTS


@app.get(
    "/admin/audit-logs",
    tags=["Administration"],
    summary="Get audit logs",
    description="Returns the most recent administrative audit log entries.",
    response_description="A list of recent audit log entries.",
)
def audit_logs(
    _: User = Depends(require_roles(Role.admin)),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return the most recent audit log entries, newest first."""
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(AUDIT_LOG_DEFAULT_LIMIT)
        .all()
    )
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