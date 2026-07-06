from .models import MatchContext, Venue


VENUES: list[Venue] = [
    Venue(
        id="atlas-dome",
        name="Atlas Dome",
        city="Austin, TX",
        capacity=68500,
        surface="Hybrid grass",
        roof="Retractable",
        transit_score=82,
        home_advantage=8.4,
        energy_index=91,
    ),
    Venue(
        id="harbor-field",
        name="Harbor Field",
        city="Seattle, WA",
        capacity=72000,
        surface="Synthetic turf",
        roof="Open air",
        transit_score=88,
        home_advantage=8.9,
        energy_index=94,
    ),
    Venue(
        id="summit-park",
        name="Summit Park",
        city="Denver, CO",
        capacity=76125,
        surface="Natural grass",
        roof="Open air",
        transit_score=73,
        home_advantage=7.8,
        energy_index=86,
    ),
]


CONTEXTS: dict[str, MatchContext] = {
    "atlas-dome": MatchContext(
        opponent="Phoenix Comets",
        expected_attendance=64200,
        weather="Humid evening, roof likely closed",
        kickoff_window="Prime time",
    ),
    "harbor-field": MatchContext(
        opponent="Portland Cascades",
        expected_attendance=70400,
        weather="Light rain, mild wind",
        kickoff_window="Late afternoon",
    ),
    "summit-park": MatchContext(
        opponent="Las Vegas Lights",
        expected_attendance=72100,
        weather="Dry, high-altitude conditions",
        kickoff_window="Early evening",
    ),
}

