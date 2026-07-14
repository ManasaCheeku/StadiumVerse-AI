import React from "react";
import { Languages, MapPinned, QrCode, Ticket, Navigation, Sparkles, Building2, Radio } from "lucide-react";
import DigitalTicket from "../components/DigitalTicket";
import Panel from "../components/Panel";
import RouteView from "../components/RouteView";
import MatchContextCard from "../components/MatchContextCard";
import QuickActions from "../components/QuickActions";
import useAsync from "../hooks/useAsync";
import "../styles/fan-dashboard.css";

import {
    fetchVenues,
    issueTicket,
    routeTo,
    type RouteResponse,
    type Ticket as TicketType,
    type User,
    type Venue,
} from "../api";
import "../styles/fan-dashboard.css";
interface FanProps {
    user: User | null;
    onAskCopilot: (msg: string, persona: string, lang?: string) => void;
}

function Fan({ user, onAskCopilot }: FanProps) {
    const [ticket, setTicket] = React.useState<TicketType | null>(null);
    const [route, setRoute] = React.useState<RouteResponse | null>(null);
    const { data: venues } = useAsync<Venue[]>(fetchVenues, []);

    return (
        <section className="fan-dashboard">
            {/* Match Context — unchanged component, framed in a scoreboard strip */}
            <div className="fan-context-strip">
                <MatchContextCard ticket={ticket} />
            </div>

            {/* Quick Actions — unchanged component, framed in a slim rail */}
            <div className="fan-quickactions-rail">
                <QuickActions onAskCopilot={onAskCopilot} isLoggedIn={!!user} />
            </div>

            {/* Hero */}
            <div className="fan-hero">
                <div className="fan-hero__glow" aria-hidden="true" />
                <p className="fan-eyebrow">
                    <Radio size={13} />
                    Fan Journey &middot; Harbor Field
                </p>
                <h2 className="fan-hero__title">
                    Your ticket, your route, your questions — sorted before kickoff.
                </h2>

                <div className="fan-hero__actions">
                    <button
                        className="fan-action fan-action--gold"
                        disabled={false}
                        onClick={async () => {
                            try {
                                console.log("Generating ticket...");

                                const data = await issueTicket();

                                console.log("Ticket Response:", data);

                                setTicket(data);
                            } catch (err: any) {
                                console.error("Ticket Error:", err);
                                console.error("Status:", err?.response?.status);
                                console.error("Response:", err?.response?.data);
                                console.error("Headers:", err?.response?.headers);

                                alert("Ticket generation failed.");
                            }
                        }}
                    >
                        <span className="fan-action__icon">
                            <QrCode size={18} />
                        </span>
                        Generate QR Ticket
                    </button>

                    <button
                        className="fan-action fan-action--turf"
                        disabled={false}
                        onClick={() => routeTo("Gate 5", "Emergency Exit 3", "wheelchair").then(setRoute)}
                    >
                        <span className="fan-action__icon">
                            <MapPinned size={18} />
                        </span>
                        Accessible Route
                    </button>

                    <button
                        className="fan-action fan-action--blue"
                        disabled={false}
                        onClick={() => onAskCopilot("Find nearby food", "fan", "Hindi")}
                    >
                        <span className="fan-action__icon">
                            <Languages size={18} />
                        </span>
                        Ask AI (Hindi)
                    </button>
                </div>
            </div>

            {/* Card grid */}
            <div className="fan-grid">
                <div className="fan-card fan-card--gold fan-card--span-wide">
                    <Panel title="Digital Ticket">
                        {ticket ? (
                            <div className="fan-ticket-frame">
                                <DigitalTicket
                                    ticket={{
                                        fanName: user?.full_name ?? "Football Fan",
                                        match: "Harbor FC vs Summit City",
                                        stadium: "Harbor Field",
                                        gate: ticket.gate,
                                        seat: ticket.seat,
                                        ticketId: ticket.ticket_code,
                                        kickoff: "19:30",
                                        date: "10 July 2026",
                                        status: "VALID",
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="fan-empty-state">
                                <Ticket size={26} className="fan-empty-state__icon" />
                                <p>
                                    No ticket yet. Tap <strong>Generate QR Ticket</strong> above to
                                    create your gate pass.
                                </p>
                            </div>
                        )}
                    </Panel>
                </div>

                <div className="fan-card fan-card--turf fan-card--span-narrow">
                    <Panel title="Indoor Navigation">
                        {route ? (
                            <div className="fan-route-frame">
                                <RouteView route={route} />
                            </div>
                        ) : (
                            <div className="fan-empty-state">
                                <Navigation size={26} className="fan-empty-state__icon" />
                                <p>Routes adapt for wheelchair users, seniors, and families.</p>
                            </div>
                        )}
                    </Panel>
                </div>

                <div className="fan-card fan-card--blue fan-card--span-narrow">
                    <Panel title="Fan Agent">
                        <div className="fan-agent-hint">
                            <span className="fan-agent-hint__pulse" aria-hidden="true" />
                            <p>
                                <Sparkles size={15} className="fan-agent-hint__icon" />
                                Use the floating Copilot at the bottom right to ask about gates,
                                seats, food, restrooms, parking, or safety procedures.
                            </p>
                        </div>
                    </Panel>
                </div>

                <div className="fan-card fan-card--gold fan-card--span-wide">
                    <Panel title="Tournament Venues">
                        {venues && venues.length > 0 ? (
                            <ul className="fan-venue-list">
                                {venues.map((venue) => (
                                    <li key={venue.name} className="fan-venue-list__item">
                                        <Building2 size={16} />
                                        {venue.name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="fan-empty-state">
                                <Building2 size={26} className="fan-empty-state__icon" />
                                <p>Venue list is loading.</p>
                            </div>
                        )}
                    </Panel>
                </div>
            </div>
        </section>
    );
}

export default Fan;