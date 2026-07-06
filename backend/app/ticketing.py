import json
import secrets
from datetime import UTC, datetime
from sqlalchemy.orm import Session

from .config import get_settings
from .domain import AuditLog, Ticket, User
from .schemas import ScanResponse, TicketCreate
from .security import _b64, decode_token


def sign_ticket(payload: dict[str, str]) -> str:
    token_subject = f"ticket:{payload['ticket_code']}"
    jwt = __import__("app.security", fromlist=["create_access_token"]).create_access_token(token_subject, "ticket")
    return f"{_b64(json.dumps(payload).encode())}.{jwt}"


def issue_ticket(db: Session, owner: User, request: TicketCreate) -> Ticket:
    code = f"SV-{secrets.token_hex(5).upper()}"
    payload = {
        "ticket_code": code,
        "owner": owner.email,
        "match_id": request.match_id,
        "stadium_id": request.stadium_id,
        "valid_on": request.valid_on,
    }
    ticket = Ticket(
        ticket_code=code,
        owner_id=owner.id,
        match_id=request.match_id,
        stadium_id=request.stadium_id,
        gate=request.gate,
        seat=request.seat,
        valid_on=request.valid_on,
        qr_payload=sign_ticket(payload),
    )
    db.add(ticket)
    db.add(AuditLog(actor_email=owner.email, action="ticket_issued", detail=code, risk_score=0))
    db.commit()
    db.refresh(ticket)
    return ticket


def validate_scan(db: Session, actor: User, qr_payload: str, stadium_id: str, match_id: str) -> ScanResponse:
    try:
        encoded_payload, jwt = qr_payload.split(".", 1)
        claims = decode_token(jwt)
        if claims["role"] != "ticket":
            raise ValueError("not a ticket token")
        payload = json.loads(__import__("base64").urlsafe_b64decode(encoded_payload + "=" * (-len(encoded_payload) % 4)))
    except Exception:
        db.add(AuditLog(actor_email=actor.email, action="qr_fraud", detail="Malformed QR", risk_score=0.95))
        db.commit()
        return ScanResponse(status="denied", message="Fraudulent or malformed QR code.", recommended_action="Escalate to security desk.", risk_score=0.95)

    ticket = db.query(Ticket).filter(Ticket.ticket_code == payload["ticket_code"]).one_or_none()
    if ticket is None:
        db.add(AuditLog(actor_email=actor.email, action="qr_unknown", detail=payload["ticket_code"], risk_score=0.9))
        db.commit()
        return ScanResponse(status="denied", ticket_code=payload["ticket_code"], message="Ticket not found.", recommended_action="Hold entry and verify ID.", risk_score=0.9)

    if ticket.stadium_id != stadium_id or ticket.match_id != match_id:
        db.add(AuditLog(actor_email=actor.email, action="qr_context_mismatch", detail=ticket.ticket_code, risk_score=0.82))
        db.commit()
        return ScanResponse(status="denied", ticket_code=ticket.ticket_code, message="Ticket does not match this stadium or match.", recommended_action="Redirect to ticket resolution.", risk_score=0.82)

    if ticket.used:
        db.add(AuditLog(actor_email=actor.email, action="duplicate_scan", detail=ticket.ticket_code, risk_score=0.88))
        db.commit()
        return ScanResponse(status="denied", ticket_code=ticket.ticket_code, message="Duplicate QR scan detected.", recommended_action="Dispatch nearest response team.", risk_score=0.88)

    ticket.used = True
    ticket.used_at = datetime.now(UTC)
    db.add(AuditLog(actor_email=actor.email, action="entry_granted", detail=ticket.ticket_code, risk_score=0.05))
    db.commit()
    return ScanResponse(status="approved", ticket_code=ticket.ticket_code, message="Entry approved. Stadium Mode activated.", recommended_action=f"Guide fan to {ticket.gate}, seat {ticket.seat}.", risk_score=0.05)
