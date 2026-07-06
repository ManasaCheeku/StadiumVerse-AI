from pydantic import BaseModel, Field


class Venue(BaseModel):
    id: str
    name: str
    city: str
    capacity: int
    surface: str
    roof: str
    transit_score: int = Field(ge=0, le=100)
    home_advantage: float = Field(ge=0, le=10)
    energy_index: int = Field(ge=0, le=100)


class MatchContext(BaseModel):
    opponent: str
    expected_attendance: int
    weather: str
    kickoff_window: str


class Insight(BaseModel):
    title: str
    summary: str
    confidence: float = Field(ge=0, le=1)


class VenueInsights(BaseModel):
    venue: Venue
    context: MatchContext
    insights: list[Insight]
    recommendations: list[str]

