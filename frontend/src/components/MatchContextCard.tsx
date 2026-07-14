import React from "react";
import { Clock, MapPin, QrCode, Users } from "lucide-react";
import type { Ticket } from "../api";

interface MatchContextCardProps {
  ticket?: Ticket | null;
}

function MatchContextCard({ ticket = null }: MatchContextCardProps) {
const [timeLeft, setTimeLeft] = React.useState("");

  // Countdown to next kickoff: July 10, 2026 at 19:30:00+05:30 (Seattle match)
  const kickoffDate = React.useMemo(() => new Date("2026-07-10T19:30:00+05:30"), []);

  React.useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = kickoffDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("LIVE / IN PROGRESS");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [kickoffDate]);

  return (
    <div className="match-context-card">
      <div className="match-card-left">
        <div>
          <span className="eyebrow" style={{ color: "#d7eee7", marginBottom: "4px", display: "block" }}>Match Day Live Context</span>
          <h3 className="match-teams">Harbor FC vs Summit City</h3>
        </div>

        <div className="match-meta-grid">
          <div className="match-meta-item">
            <MapPin size={16} />
            <span><strong>Venue:</strong> Harbor Field (Seattle, WA)</span>
          </div>
          <div className="match-meta-item">
            <Clock size={16} />
            <span><strong>Kickoff:</strong> July 10, 2026 - 19:30</span>
          </div>
          <div className="match-meta-item">
            <QrCode size={16} />
            <span><strong>Gate:</strong> {ticket ? ticket.gate : "Gate 5 (Demo)"}</span>
          </div>
          <div className="match-meta-item">
            <Users size={16} />
            <span><strong>Seat:</strong> {ticket ? ticket.seat : "Row 12, Seat A12 (Demo)"}</span>
          </div>
        </div>

        {/* Real-time Status Badges */}
        <div className="match-status-row">
          <div className="match-status-badge">
            <span>Weather</span>
            <strong>🌦️ 19°C · Rain</strong>
          </div>
          <div className="match-status-badge">
            <span>Crowd Level</span>
            <strong>📈 Medium (62%)</strong>
          </div>
          <div className="match-status-badge">
            <span>Parking East</span>
            <strong>🚗 248 slots</strong>
          </div>
          <div className="match-status-badge">
            <span>Transport</span>
            <strong>🚊 Rail Normal</strong>
          </div>
        </div>
      </div>

      <div className="match-card-right">
        <span className="match-countdown-label">Kickoff Countdown</span>
        <Clock size={32} style={{ color: "#d06f3c", marginBottom: "8px" }} />
        <span className="match-countdown-value">{timeLeft}</span>
      </div>
    </div>
  );
}

export default MatchContextCard;