from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    role: str = "fan"


class LoginRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class UserResponse(BaseModel):
    email: str
    full_name: str
    role: str


class TicketCreate(BaseModel):
    match_id: str = "final-2026"
    stadium_id: str = "atlas-dome"
    gate: str = "Gate 5"
    seat: str = "A12-34"
    valid_on: str = "2026-07-06"


class TicketResponse(BaseModel):
    ticket_code: str
    qr_payload: str
    gate: str
    seat: str
    stadium_id: str


class ScanRequest(BaseModel):
    qr_payload: str
    stadium_id: str
    match_id: str


class ScanResponse(BaseModel):
    status: str
    ticket_code: str | None = None
    message: str
    recommended_action: str
    risk_score: float


class NavigationRequest(BaseModel):
    start: str
    destination: str
    accessibility: str = "standard"


class RouteResponse(BaseModel):
    route: list[str]
    directions: list[str]
    estimated_minutes: int
    accessibility_notes: list[str]


class AgentRequest(BaseModel):
    persona: str
    message: str
    language: str = "English"
    accessibility: str = "standard"


class AgentResponse(BaseModel):
    agent: str
    answer: str
    actions: list[str]
    confidence: float
    language: str
