import React from "react";
import {
  QrCode,
  ShieldAlert,
  Siren,
  TicketCheck,
  Timer,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
  Megaphone,
  Radio,
  Activity,
  Radar,
} from "lucide-react";
import Panel from "../components/Panel";
import { scanTicket, type ScanResponse } from "../api";
import "../styles/security-dashboard.css";

/* ============================================================
   Local UI-only types.
   These describe demo content for the sections your brief asked
   for that don't have a backend contract yet (incidents, activity
   feed, broadcast). They don't touch ScanResponse or anything
   coming from ../api.
   ============================================================ */

interface Incident {
  id: string;
  title: string;
  location: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  time: string;
  status: "Active" | "Resolved";
}

interface ActivityEvent {
  id: string;
  label: string;
  detail: string;
  time: string;
  tone: "valid" | "warning" | "critical" | "resolved";
}

const initialIncidents: Incident[] = [
  { id: "INC-3841", title: "Suspicious Crowd Activity", location: "Gate 3", severity: "High", time: "2 min ago", status: "Active" },
  { id: "INC-3842", title: "Unauthorized Entry", location: "VIP Entrance", severity: "Critical", time: "6 min ago", status: "Active" },
  { id: "INC-3843", title: "Medical Emergency", location: "East Stand", severity: "Medium", time: "14 min ago", status: "Active" },
];

const activityFeed: ActivityEvent[] = [
  { id: "a1", label: "Ticket validated", detail: "Gate 2 · TCKT-88213 cleared", time: "1 min ago", tone: "valid" },
  { id: "a2", label: "Duplicate scan detected", detail: "Gate 3 · TCKT-40213 flagged", time: "4 min ago", tone: "warning" },
  { id: "a3", label: "Medical emergency resolved", detail: "East Stand · Unit 4 responded", time: "18 min ago", tone: "resolved" },
  { id: "a4", label: "Suspicious activity reported", detail: "Gate 3 · Crowd density alert", time: "26 min ago", tone: "critical" },
];

const severityRank: Record<Incident["severity"], number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const severityBadgeClass: Record<Incident["severity"], string> = {
  Critical: "sdo-badge-critical",
  High: "sdo-badge-high",
  Medium: "sdo-badge-medium",
  Low: "sdo-badge-low",
};
const severityStripClass: Record<Incident["severity"], string> = {
  Critical: "sdo-strip-critical",
  High: "sdo-strip-high",
  Medium: "sdo-strip-medium",
  Low: "sdo-strip-low",
};
const toneDotColor: Record<ActivityEvent["tone"], string> = {
  valid: "var(--sdo-green)",
  warning: "var(--sdo-amber)",
  critical: "var(--sdo-red)",
  resolved: "var(--sdo-muted)",
};

function verdictBadgeClass(status: ScanResponse["status"]) {
  const key = String(status).toLowerCase();
  if (key === "valid") return "sdo-badge-valid";
  if (key === "warning") return "sdo-badge-warning";
  return "sdo-badge-threat";
}

function gaugeColor(pct: number) {
  if (pct < 30) return "var(--sdo-green)";
  if (pct < 65) return "var(--sdo-amber)";
  return "var(--sdo-red)";
}

function SecurityDesk() {
  // --- unchanged from the original implementation ---
  const [qr, setQr] = React.useState("");
  const [result, setResult] = React.useState<ScanResponse | null>(null);

  // --- new local state for the additional dashboard sections ---
  const [incidents, setIncidents] = React.useState<Incident[]>(initialIncidents);
  const [alertMessage, setAlertMessage] = React.useState("");

  const activeIncidents = incidents.filter((i) => i.status === "Active");
  const criticalCount = activeIncidents.filter((i) => i.severity === "Critical").length;
  const sortedIncidents = [...incidents].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  function resolveIncident(id: string) {
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Resolved" as const } : i)));
  }

  function broadcastAlert() {
    alert("Emergency Alert Broadcasted");
  }

  const riskPct = result ? Math.round(result.risk_score * 100) : 0;

  return (
    <div className="sdo-root">
      {/* ---------------- Header ---------------- */}
      <div className="sdo-page-header">
        <div className="sdo-eyebrow">
          <span className="sdo-live-dot" />
          LIVE · STADIUMVERSE OPS
        </div>
        <h1 className="sdo-page-title">Security Dispatch &amp; Operations Center</h1>
        <p className="sdo-page-subtitle">AI-powered threat monitoring, QR validation, and emergency response.</p>
        <Radar className="sdo-header-radar-icon" size={22} />
      </div>

      {/* ---------------- KPI Cards ---------------- */}
      <section className="sdo-kpi-grid">
        <div className="sdo-kpi-card">
          <div className="sdo-kpi-icon sdo-icon-amber"><ShieldAlert size={20} /></div>
          <div className="sdo-kpi-label">Active Incidents</div>
          <div className="sdo-kpi-value">{activeIncidents.length}</div>
          <div className="sdo-kpi-sub">{incidents.length} total logged today</div>
        </div>
        <div className="sdo-kpi-card">
          <div className="sdo-kpi-icon sdo-icon-red"><Siren size={20} /></div>
          <div className="sdo-kpi-label">Critical Alerts</div>
          <div className="sdo-kpi-value">{criticalCount}</div>
          <div className="sdo-kpi-sub">Requires immediate response</div>
        </div>
        <div className="sdo-kpi-card">
          <div className="sdo-kpi-icon sdo-icon-cyan"><TicketCheck size={20} /></div>
          <div className="sdo-kpi-label">Tickets Scanned Today</div>
          <div className="sdo-kpi-value">4,286</div>
          <div className="sdo-kpi-sub">+312 in the last hour</div>
        </div>
        <div className="sdo-kpi-card">
          <div className="sdo-kpi-icon sdo-icon-green"><Timer size={20} /></div>
          <div className="sdo-kpi-label">Avg. Response Time</div>
          <div className="sdo-kpi-value">2m 14s</div>
          <div className="sdo-kpi-sub">Within target threshold</div>
        </div>
      </section>

      <section className="sdo-two-col">
        {/* ---------------- Left column ---------------- */}
        <div className="sdo-col">
          <Panel title="Live Incident Reports">
            <div className="sdo-incident-list">
              {sortedIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`sdo-incident ${severityStripClass[incident.severity]} ${
                    incident.status === "Resolved" ? "sdo-incident-resolved" : ""
                  }`}
                >
                  <div className="sdo-incident-main">
                    <div className="sdo-incident-title-row">
                      <span className="sdo-incident-title">{incident.title}</span>
                      <span className={`sdo-badge ${severityBadgeClass[incident.severity]}`}>{incident.severity}</span>
                      {incident.status === "Resolved" && <span className="sdo-badge sdo-badge-resolved">Resolved</span>}
                    </div>
                    <div className="sdo-incident-meta">
                      <span><MapPin size={13} /> {incident.location}</span>
                      <span className="sdo-mono"><Clock size={13} /> {incident.time}</span>
                    </div>
                  </div>
                  {incident.status === "Active" ? (
                    <button className="sdo-btn" onClick={() => resolveIncident(incident.id)}>
                      <CheckCircle2 size={15} /> Mark Resolved
                    </button>
                  ) : (
                    <span className="sdo-incident-closed">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          {/* ---------------- QR Validation (unchanged logic) ---------------- */}
          <Panel title="QR Validation">
            <p className="sdo-panel-hint">Paste or scan a ticket QR payload to run it through threat assessment.</p>
            <textarea
              className="sdo-textarea"
              rows={4}
              value={qr}
              onChange={(event) => setQr(event.target.value)}
              placeholder="Paste fan QR payload"
            />
            <div className="sdo-actions-row">
              <button className="sdo-btn sdo-btn-primary" onClick={() => scanTicket(qr).then(setResult)}>
                <QrCode size={18} /> Scan Ticket
              </button>
            </div>
          </Panel>

          <Panel title="Emergency Broadcast">
            <p className="sdo-panel-hint">Send an alert to all stadium security personnel and dispatch channels.</p>
            <textarea
              className="sdo-textarea"
              rows={3}
              value={alertMessage}
              onChange={(event) => setAlertMessage(event.target.value)}
              placeholder="Type the emergency alert message…"
            />
            <div className="sdo-actions-row">
              <button className="sdo-btn sdo-btn-danger" onClick={broadcastAlert}>
                <Radio size={15} /> Broadcast Emergency Alert
              </button>
            </div>
          </Panel>
        </div>

        {/* ---------------- Right column ---------------- */}
        <div className="sdo-col">
          {/* ---------------- Threat Assessment (unchanged logic) ---------------- */}
          <Panel title="Threat Assessment">
            {result ? (
              <div className="sdo-verdict sdo-fade-in">
                <div className="sdo-verdict-row">
                  <span className="sdo-panel-hint" style={{ margin: 0 }}>Status</span>
                  <span className={`sdo-badge ${verdictBadgeClass(result.status)}`}>{result.status}</span>
                </div>
                <p className="sdo-verdict-message">{result.message}</p>
                <div>
                  <div className="sdo-verdict-row">
                    <span className="sdo-panel-hint" style={{ margin: 0 }}>Risk Score</span>
                    <span className="sdo-mono" style={{ color: gaugeColor(riskPct) }}>{riskPct}%</span>
                  </div>
                  <div className="sdo-gauge-track">
                    <div className="sdo-gauge-fill" style={{ width: `${riskPct}%`, background: gaugeColor(riskPct) }} />
                  </div>
                </div>
                <div className="sdo-verdict-action">
                  <span className="sdo-panel-hint">Recommended Action</span>
                  <span>{result.recommended_action}</span>
                </div>
              </div>
            ) : (
              <p className="sdo-panel-hint">
                Validates authenticity, match, stadium, duplicate scans, and fraud attempts.
              </p>
            )}
          </Panel>

          <Panel title="Recent Security Activity">
            <div className="sdo-timeline">
              <div className="sdo-timeline-line" />
              {activityFeed.map((event) => (
                <div key={event.id} className="sdo-timeline-item">
                  <span className="sdo-timeline-dot" style={{ background: toneDotColor[event.tone] }} />
                  <div>
                    <div className="sdo-timeline-label">{event.label}</div>
                    <div className="sdo-timeline-detail">{event.detail}</div>
                    <div className="sdo-timeline-time sdo-mono">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}

export default SecurityDesk;