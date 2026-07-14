from .schemas import (
    AgentRequest,
    AgentResponse,
    NavigationRequest,
    RouteResponse,
)
from .translations import HEADERS_TR, RESPONSES_TR

STADIUM_GRAPH = {
    "Gate 1": ["Concourse A", "Parking East"],
    "Gate 5": ["Concourse B", "Medical Center"],
    "Concourse A": ["Section A12", "Food Court North", "Restroom A"],
    "Concourse B": ["Section B20", "Food Court South", "Restroom B", "Emergency Exit 3"],
    "Section A12": ["Emergency Exit 1"],
    "Section B20": ["Emergency Exit 3"],
    "Medical Center": ["Gate 5"],
    "Parking East": ["Gate 1"],
    "Food Court North": ["Concourse A"],
    "Food Court South": ["Concourse B"],
    "Restroom A": ["Concourse A"],
    "Restroom B": ["Concourse B"],
    "Emergency Exit 1": ["Section A12"],
    "Emergency Exit 3": ["Concourse B", "Section B20"],
}

"""
Finds the shortest path between the requested start location and destination
using Breadth-First Search (BFS). Returns an accessible route when requested.
"""
def shortest_route(request: NavigationRequest) -> RouteResponse:    
    queue: list[tuple[str, list[str]]] = [(request.start, [request.start])]
    seen = {request.start}
    while queue:
        node, path = queue.pop(0)
        if node.lower() == request.destination.lower():
            return _route_response(path, request.accessibility)
        for next_node in STADIUM_GRAPH.get(node, []):
            if next_node not in seen:
                seen.add(next_node)
                queue.append((next_node, [*path, next_node]))
    return _route_response([request.start, "Information Desk", request.destination], request.accessibility)

"""
Builds a structured route response including directions, estimated travel
time, and accessibility guidance.
"""

def _route_response(path: list[str], accessibility: str) -> RouteResponse:
    notes = ["Use elevator banks and low-gradient ramps."] if accessibility != "standard" else ["Standard route is available."]
    return RouteResponse(
        route=path,
        directions=[f"Proceed from {path[index]} to {path[index + 1]}." for index in range(len(path) - 1)],
        estimated_minutes=max(2, (len(path) - 1) * (4 if accessibility != "standard" else 3)),
        accessibility_notes=notes,
    )

"""
Returns simulated crowd intelligence including gate occupancy, queue lengths,
density predictions, and operational recommendations.
"""
def crowd_intelligence() -> dict:
    gates = [
        {"gate": "Gate 1", "occupancy": 68, "queue": 11},
        {"gate": "Gate 3", "occupancy": 91, "queue": 24},
        {"gate": "Gate 5", "occupancy": 57, "queue": 8},
        {"gate": "Gate 7", "occupancy": 78, "queue": 16},
    ]
    return {
        "density": 82,
        "prediction": "Gate 3 will exceed safe queue thresholds in 12 minutes.",
        "gate_occupancy": gates,
        "recommendations": [
            "Redirect 18% of arrivals from Gate 3 to Gate 5.",
            "Deploy four volunteers to Concourse B before halftime.",
            "Open overflow lane at Food Court South for 20 minutes.",
        ],
    }

"""
Generates a real-time operational dashboard snapshot containing KPIs,
parking utilization, volunteer status, food court wait times,
security incidents, and crowd analytics.
"""
def operations_snapshot() -> dict:
    return {
        "kpis": {"attendance": 64200, "entry_rate_per_min": 1180, "incidents": 3, "medical_alerts": 1},
        "parking": {"east": 81, "west": 64, "accessible": 42},
        "food_courts": {"north_wait": 7, "south_wait": 18, "family_zone_wait": 5},
        "volunteers": [
            {"name": "Team Alpha", "zone": "Gate 3", "status": "Queue support"},
            {"name": "Team Bravo", "zone": "Medical Center", "status": "Standby"},
        ],
        "security_incidents": [
            {"type": "Duplicate QR", "zone": "Gate 3", "severity": "High"},
            {"type": "Bag check delay", "zone": "Gate 7", "severity": "Medium"},
        ],
        "crowd": crowd_intelligence(),
    }
"""
Generates emergency response recommendations, announcements,
volunteer actions, and escalation guidance based on the incident type.
"""

def emergency_response(kind: str) -> dict:
    routes = {
        "medical": "Move responders through Gate 5 to Medical Center, keep Concourse B clear.",
        "fire": "Evacuate Section B20 via Emergency Exit 3 and stop inward gate flow.",
        "stampede": "Pause entry at Gate 3, open lateral barriers, broadcast slow-walk guidance.",
        "lost child": "Lock down child-safe handoff points and alert all volunteer leads.",
    }
    return {
        "incident": kind,
        "route": routes.get(kind.lower(), "Route incident traffic to the nearest emergency exit."),
        "announcement": f"Attention guests: follow staff instructions for {kind} support. Stay calm and keep aisles clear.",
        "volunteer_checklist": ["Confirm exact location", "Keep radio channel open", "Guide guests away from response path"],
        "manager_alert": "Escalated to command center with live crowd overlay.",
    }
"""
Processes user queries by detecting persona, language, and intent,
then generates structured multilingual AI responses for navigation,
emergency assistance, food recommendations, volunteer support,
incident reporting, and stadium operations.
"""

def answer_agent(request: AgentRequest) -> AgentResponse:
    message = request.message.lower()
    
    # 1. PERSONA AUTO-DETECTION & VALIDATION
    valid_personas = {"fan", "volunteer", "security", "manager", "organizer"}
    persona = request.persona.lower()
    
    if persona not in valid_personas:
        # Detect from message content
        if any(w in message for w in ["security", "scan", "threat", "police", "contraband", "prohibited", "weapons", "arrest", "suspicious", "fraud", "duplicate", "theft"]):
            persona = "security"
        elif any(w in message for w in ["volunteer", "assign", "sop", "crowd duty", "help desk", "lost child"]):
            persona = "volunteer"
        elif any(w in message for w in ["operations", "kpis", "manager", "attendance", "parking", "occupancy", "dashboard"]):
            persona = "manager"
        elif any(w in message for w in ["organizer", "vip", "ceremony", "schedule delay", "press", "media", "sponsor"]):
            persona = "organizer"
        else:
            persona = "fan"
            
    # 2. RESOLVE LANGUAGE (Fallback to English if unsupported)
    language = request.language.lower()
    if language not in HEADERS_TR:
        language = "english"
        
    hd = HEADERS_TR[language]
    rp = RESPONSES_TR[language]
    
    # 3. IDENTIFY AGENT TYPE & RESPONSES
    is_emergency = any(w in message for w in ["emergency", "fire", "medical", "injury", "heart attack", "stampede", "accident", "smoke", "alarm"])
    is_incident = any(w in message for w in ["report", "broken", "spill", "fight", "stolen", "theft", "unattended", "vandalism"]) and not is_emergency
    is_food = "food" in message or "drink" in message or "water" in message or "concessions" in message or "hungry" in message
    is_nav = any(w in message for w in ["gate", "navigate", "route", "seat", "restroom", "toilet", "exit", "where", "how do i get", "concourse", "direction"])
    
    agent_name = "Language Agent"
    prefix_key = "default"
    
    if is_emergency:
        agent_name = "Emergency Response Agent"
        prefix_key = "emergency"
    elif is_food:
        agent_name = "Food Recommendation Agent"
        prefix_key = "food"
    elif is_nav or "restroom" in message or "seat" in message or "gate" in message or "exit" in message:
        agent_name = "Fan Navigation Agent"
        prefix_key = "navigation"
    elif persona == "volunteer" or "lost child" in message:
        agent_name = "Volunteer Assistant"
        prefix_key = "volunteer"
    elif persona == "security":
        agent_name = "Security Agent"
        prefix_key = "incident" if is_incident else "default"
        
    # Generate structured output body
    summary = rp[f"{prefix_key}_summary"]
    action = rp[f"{prefix_key}_action"]
    reasoning = rp[f"{prefix_key}_reasoning"]
    alt = rp[f"{prefix_key}_alt"]
    accessibility = rp[f"{prefix_key}_access"]
    safety = rp[f"{prefix_key}_safety"]
    
    # Format Incident Reporting block if incident reported
    incident_block = ""
    if is_incident or (persona == "security" and "report" in message):
        incident_type = "Facility / Security Alert"
        priority = "Medium"
        location = "General Concourse"
        escalation = "No"
        emergency_level = "Green"
        
        if any(w in message for w in ["fight", "stolen", "theft", "weapons", "assault"]):
            priority = "Critical"
            escalation = "Yes"
            emergency_level = "Red"
            incident_type = "Security Breach / Altercation"
        elif any(w in message for w in ["spill", "slip", "wet"]):
            incident_type = "Slip Hazard / Facility"
            priority = "Low"
        elif any(w in message for w in ["unattended", "bag"]):
            incident_type = "Unattended Baggage"
            priority = "High"
            escalation = "Yes"
            emergency_level = "Yellow"
            
        # Multilingual header mapping for Incident Report
        if language == "hindi":
            incident_block = (
                f"\n**[घटना रिपोर्ट (Incident Report)]**\n"
                f"- घटना का प्रकार (Incident Type): {incident_type}\n"
                f"- प्राथमिकता (Priority): {priority}\n"
                f"- स्थान (Location): {location}\n"
                f"- विवरण (Description): {request.message}\n"
                f"- अनुशंसित कार्रवाई (Suggested Action): निरीक्षण के लिए तत्काल टीम भेजें।\n"
                f"- एस्केलेशन आवश्यक (Escalation Required): {escalation}\n"
                f"- आपातकालीन स्तर (Emergency Level): {emergency_level}\n\n"
            )
        elif language == "kannada":
            incident_block = (
                f"\n**[ಘಟನೆ ವರದಿ (Incident Report)]**\n"
                f"- ಘಟನೆಯ ಪ್ರಕಾರ (Incident Type): {incident_type}\n"
                f"- ಆದ್ಯತೆ (Priority): {priority}\n"
                f"- ಸ್ಥಳ (Location): {location}\n"
                f"- ವಿವರಣೆ (Description): {request.message}\n"
                f"- ಶಿಫಾರಸು ಮಾಡಿದ ಕ್ರಮ (Suggested Action): ತಕ್ಷಣ ಸ್ಥಳ ಪರಿಶೀಲನೆಗೆ ತಂಡವನ್ನು ಕಳುಹಿಸಿ.\n"
                f"- ಹೆಚ್ಚಿನ ತನಿಖೆ ಅಗತ್ಯವೇ (Escalation Required): {escalation}\n"
                f"- ತುರ್ತು ಮಟ್ಟ (Emergency Level): {emergency_level}\n\n"
            )
        elif language == "spanish":
            incident_block = (
                f"\n**[Informe de Incidente (Incident Report)]**\n"
                f"- Tipo de Incidente (Incident Type): {incident_type}\n"
                f"- Prioridad (Priority): {priority}\n"
                f"- Ubicación (Location): {location}\n"
                f"- Descripción (Description): {request.message}\n"
                f"- Acción Sugerida (Suggested Action): Despachar personal para inspección inmediata.\n"
                f"- Escalación Requerida (Escalation Required): {escalation}\n"
                f"- Nivel de Emergencia (Emergency Level): {emergency_level}\n\n"
            )
        elif language == "french":
            incident_block = (
                f"\n**[Rapport d'Incident (Incident Report)]**\n"
                f"- Type d'Incident (Incident Type): {incident_type}\n"
                f"- Priorité (Priority): {priority}\n"
                f"- Emplacement (Location): {location}\n"
                f"- Description (Description): {request.message}\n"
                f"- Action Suggérée (Suggested Action): Envoyer immédiatement une équipe pour inspection.\n"
                f"- Escalade Requise (Escalation Required): {escalation}\n"
                f"- Niveau d'Urgence (Emergency Level): {emergency_level}\n\n"
            )
        else:
            incident_block = (
                f"\n**[Incident Report Summary]**\n"
                f"- Incident Type: {incident_type}\n"
                f"- Priority: {priority}\n"
                f"- Location: {location}\n"
                f"- Description: {request.message}\n"
                f"- Suggested Action: Dispatch ground unit for immediate inspection.\n"
                f"- Escalation Required: {escalation}\n"
                f"- Emergency Level: {emergency_level}\n\n"
            )

    # 4. ASSEMBLE COMPREHENSIVE MARKDOWN ANSWER
    answer_parts = [
        f"{hd['summary']}\n{summary}\n",
        incident_block,
        f"{hd['action']}\n{action}\n",
        f"{hd['reasoning']}\n{reasoning}\n",
        f"{hd['alternative']}\n{alt}\n",
        f"{hd['accessibility']}\n{accessibility}\n",
        f"{hd['safety']}\n{safety}"
    ]
    
    # Filter out empty or None blocks and join
    answer = "\n".join([p for p in answer_parts if p.strip()])
    
    # Generate action steps dynamically
    actions = ["Show nearest map route", "Contact Zone Lead"]
    if is_emergency:
        actions = ["Evacuate zone", "Dispatch medical team", "Show emergency exits"]
    elif is_food:
        actions = ["Show food stall list", "Open menu pricing"]
    elif is_nav:
        actions = ["Generate indoor route", "Enable audio guidance"]
    elif is_incident:
        actions = ["File incident ticket", "Alert security supervisor"]

    confidence = 0.88 if is_emergency or is_nav or is_food else 0.78

    return AgentResponse(
        agent=agent_name,
        answer=answer,
        actions=actions,
        confidence=confidence,
        language=request.language
    )
