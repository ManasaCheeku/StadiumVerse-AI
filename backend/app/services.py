from .data import CONTEXTS, VENUES
from .models import Insight, Venue, VenueInsights


def list_venues() -> list[Venue]:
    return VENUES


def get_venue(venue_id: str) -> Venue | None:
    return next((venue for venue in VENUES if venue.id == venue_id), None)


def build_insights(venue_id: str) -> VenueInsights | None:
    venue = get_venue(venue_id)
    if venue is None:
        return None

    context = CONTEXTS[venue.id]
    occupancy = context.expected_attendance / venue.capacity
    crowd_pressure = min(99, round((occupancy * 62) + (venue.energy_index * 0.38)))
    ingress_pressure = max(25, round(occupancy * (100 - venue.transit_score + 45)))

    insights = [
        Insight(
            title="Crowd pressure",
            summary=f"Projected at {crowd_pressure}/100 with {context.expected_attendance:,} fans expected.",
            confidence=0.86,
        ),
        Insight(
            title="Arrival load",
            summary=f"Transit and gate demand point to a {ingress_pressure}/100 ingress load.",
            confidence=0.78,
        ),
        Insight(
            title="Competitive lift",
            summary=f"Home advantage is tracking at {venue.home_advantage:.1f}/10 for this matchup.",
            confidence=0.82,
        ),
    ]

    recommendations = [
        "Open priority gates 35 minutes earlier than baseline.",
        "Push mobile concessions offers before halftime queues peak.",
        "Increase post-match transit messaging in the fourth quarter.",
    ]

    return VenueInsights(
        venue=venue,
        context=context,
        insights=insights,
        recommendations=recommendations,
    )

