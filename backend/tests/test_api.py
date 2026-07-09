import uuid
from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def token_for(email: str, password: str = "Password123!") -> str:
    response = client.post("/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_venues() -> None:
    response = client.get("/venues")

    assert response.status_code == 200
    venues = response.json()
    assert len(venues) == 3
    assert venues[0]["id"] == "atlas-dome"


def test_venue_insights() -> None:
    response = client.get("/venues/harbor-field/insights")

    assert response.status_code == 200
    payload = response.json()
    assert payload["venue"]["name"] == "Harbor Field"
    assert len(payload["insights"]) == 3
    assert payload["recommendations"]


def test_missing_venue() -> None:
    response = client.get("/venues/unknown/insights")

    assert response.status_code == 404


def test_register_login_and_me() -> None:
    email = f"fan-{uuid.uuid4().hex}@example.com"
    register = client.post(
        "/auth/register",
        json={"email": email, "full_name": "Tournament Fan", "password": "Password123!", "role": "fan"},
    )
    assert register.status_code == 201

    token = token_for(email)
    me = client.get("/me", headers={"Authorization": f"Bearer {token}"})

    assert me.status_code == 200
    assert me.json()["role"] == "fan"


def test_authorization_blocks_fan_from_operations_dashboard() -> None:
    token = token_for("fan@stadiumverse.ai")

    response = client.get("/operations/dashboard", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 403


def test_manager_can_view_operations_dashboard() -> None:
    token = token_for("manager@stadiumverse.ai")

    response = client.get("/operations/dashboard", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert response.json()["crowd"]["density"] >= 0


def test_secure_qr_scan_and_duplicate_detection() -> None:
    fan_token = token_for("fan@stadiumverse.ai")
    security_token = token_for("security@stadiumverse.ai")
    ticket = client.post("/tickets", headers={"Authorization": f"Bearer {fan_token}"}, json={})
    assert ticket.status_code == 200

    payload = {
        "qr_payload": ticket.json()["qr_payload"],
        "stadium_id": "atlas-dome",
        "match_id": "final-2026",
    }
    first_scan = client.post("/security/scan", headers={"Authorization": f"Bearer {security_token}"}, json=payload)
    duplicate_scan = client.post("/security/scan", headers={"Authorization": f"Bearer {security_token}"}, json=payload)

    assert first_scan.status_code == 200
    assert first_scan.json()["status"] == "approved"
    assert duplicate_scan.json()["status"] == "denied"
    assert duplicate_scan.json()["risk_score"] > 0.8


def test_navigation_accessible_route() -> None:
    token = token_for("fan@stadiumverse.ai")

    response = client.post(
        "/navigation/route",
        headers={"Authorization": f"Bearer {token}"},
        json={"start": "Gate 5", "destination": "Emergency Exit 3", "accessibility": "wheelchair"},
    )

    assert response.status_code == 200
    assert response.json()["estimated_minutes"] >= 4
    assert "elevator" in response.json()["accessibility_notes"][0].lower()


def test_ai_and_emergency_services() -> None:
    volunteer_token = token_for("volunteer@stadiumverse.ai")
    ai = client.post(
        "/ai/assist",
        headers={"Authorization": f"Bearer {volunteer_token}"},
        json={"persona": "volunteer", "message": "medical emergency near gate 5", "language": "English"},
    )
    emergency = client.get("/emergency/medical", headers={"Authorization": f"Bearer {volunteer_token}"})

    assert ai.status_code == 200
    assert ai.json()["agent"] == "Emergency Response Agent"
    assert emergency.status_code == 200
    assert emergency.json()["volunteer_checklist"]


def test_admin_audit_logs() -> None:
    token = token_for("admin@stadiumverse.ai")

    response = client.get("/admin/audit-logs", headers={"Authorization": f"Bearer {token}"})

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_ai_persona_detection_and_multilingual() -> None:
    fan_token = token_for("fan@stadiumverse.ai")
    
    # Check that spanish headers are returned correctly
    response = client.post(
        "/ai/assist",
        headers={"Authorization": f"Bearer {fan_token}"},
        json={"persona": "fan", "message": "como llego a la puerta 5?", "language": "Spanish"}
    )
    assert response.status_code == 200
    assert "Resumen (Summary)" in response.json()["answer"]
    assert "Acción Recomendada" in response.json()["answer"]
    assert "Razonamiento" in response.json()["answer"]


def test_ai_incident_reporting() -> None:
    security_token = token_for("security@stadiumverse.ai")
    
    # Check that incident report structure is output for security incidents
    response = client.post(
        "/ai/assist",
        headers={"Authorization": f"Bearer {security_token}"},
        json={"persona": "security", "message": "report unattended bag under seat A12", "language": "English"}
    )
    assert response.status_code == 200
    assert "[Incident Report Summary]" in response.json()["answer"]
    assert "Incident Type: Unattended Baggage" in response.json()["answer"]
    assert "Priority: High" in response.json()["answer"]
    assert "Escalation Required: Yes" in response.json()["answer"]

