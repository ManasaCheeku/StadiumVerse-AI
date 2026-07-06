from .schemas import AgentRequest, AgentResponse, NavigationRequest, RouteResponse


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


def _route_response(path: list[str], accessibility: str) -> RouteResponse:
    notes = ["Use elevator banks and low-gradient ramps."] if accessibility != "standard" else ["Standard route is available."]
    return RouteResponse(
        route=path,
        directions=[f"Proceed from {path[index]} to {path[index + 1]}." for index in range(len(path) - 1)],
        estimated_minutes=max(2, (len(path) - 1) * (4 if accessibility != "standard" else 3)),
        accessibility_notes=notes,
    )


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


def answer_agent(request: AgentRequest) -> AgentResponse:
    message = request.message.lower()
    if "emergency" in message or "fire" in message or "medical" in message:
        return AgentResponse(agent="Emergency Response Agent", answer=emergency_response("medical")["route"], actions=["Alert command center", "Dispatch medical team"], confidence=0.9, language=request.language)
    if "food" in message:
        return AgentResponse(agent="Food Recommendation Agent", answer="Food Court North is the best option: 7 minute wait, vegetarian options, and lower crowd density.", actions=["Route to Food Court North", "Show budget meals"], confidence=0.84, language=request.language)
    if "restroom" in message or "seat" in message or "gate" in message or "exit" in message:
        return AgentResponse(agent="Fan Navigation Agent", answer="I found the safest route and adjusted it for your accessibility preference.", actions=["Generate indoor route", "Enable voice guidance"], confidence=0.88, language=request.language)
    if request.persona == "volunteer":
        return AgentResponse(agent="Volunteer Assistant", answer="Follow the SOP: assess, radio zone lead, guide guests, log completion.", actions=["Open checklist", "Assign task"], confidence=0.82, language=request.language)
    return AgentResponse(agent="Language Agent", answer="I can help with navigation, tickets, food, security, emergency guidance, and multilingual stadium support.", actions=["Detect language", "Route to specialist agent"], confidence=0.78, language=request.language)

