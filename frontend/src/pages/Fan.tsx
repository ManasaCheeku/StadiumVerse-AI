import React from "react";
import { Languages, MapPinned, QrCode } from "lucide-react";
import DigitalTicket from "../components/DigitalTicket";
import Panel from "../components/Panel";
import RouteView from "../components/RouteView";
import MatchContextCard from "../components/MatchContextCard";
import QuickActions from "../components/QuickActions";
import useAsync from "../hooks/useAsync";
import {
    fetchVenues,
    issueTicket,
    routeTo,
    type RouteResponse,
    type Ticket,
    type User,
    type Venue,
} from "../api";

interface FanProps {
    user: User | null;
    onAskCopilot: (msg: string, persona: string, lang?: string) => void;
}

function Fan({ user, onAskCopilot }: FanProps) {
    const [ticket, setTicket] = React.useState<Ticket | null>(null);
    const [route, setRoute] = React.useState<RouteResponse | null>(null);
    const { data: venues } = useAsync<Venue[]>(fetchVenues, []);

    return (
        <section className="workspace two">
            {/* Match Context Card — spans both columns */}
            <MatchContextCard ticket={ticket} />

            {/* Quick Actions — spans both columns */}
            <QuickActions
                onAskCopilot={onAskCopilot}
                isLoggedIn={!!user}
            />
            <div className="heroPanel">
                <p className="eyebrow">Fan Journey</p>
                <h2>Arrival, ticketing, navigation, and multilingual help in one stadium mode.</h2>
                <div className="buttonRow">
                    <button
                        disabled={!user}
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
                        <QrCode size={18} />
                        Generate QR Ticket
                    </button>          <button disabled={!user} onClick={() => routeTo("Gate 5", "Emergency Exit 3", "wheelchair").then(setRoute)}><MapPinned size={18} />Accessible Route</button>
                    <button disabled={!user} onClick={() => onAskCopilot("Find nearby food", "fan", "Hindi")}><Languages size={18} />Ask AI (Hindi)</button>
                </div>
            </div>
            <div className="panelStack">
                <Panel title="Digital Ticket">
                    {ticket ? (
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
                    ) : (
                        <p>Click <strong>Generate QR Ticket</strong> to create your ticket.</p>
                    )}
                </Panel>
                <Panel title="Indoor Navigation">{route ? <RouteView route={route} /> : <p>Routes adapt for wheelchair users, seniors, and families.</p>}</Panel>
                <Panel title="Fan Agent"><p>Use the floating Copilot at the bottom right to ask about gates, seats, food, restrooms, parking, or safety procedures.</p></Panel>
                <Panel title="Tournament Venues"><p>{venues?.map((venue) => venue.name).join(" / ")}</p></Panel>
            </div>
        </section>
    );
}

export default Fan;