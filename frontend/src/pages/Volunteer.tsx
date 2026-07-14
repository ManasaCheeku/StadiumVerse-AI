import React from "react";
import {
  AlertTriangle,
  ClipboardList,
  ShieldAlert,
  HeartPulse,
  Accessibility,
  Users,
  CheckCircle2,
  Circle,
  MapPin,
  Clock,
  Radar,
  Activity,
  Radio,
  Navigation,
} from "lucide-react";
import Panel from "../components/Panel";
import { emergency } from "../api";
import "../styles/Volunteer-dashboard.css";

interface VolunteerProps {
  onAskCopilot: (msg: string, persona: string, lang?: string) => void;
}

/* ============================================================
   Local UI-only types & demo data.
   These back the extra sections in the brief (checklist, sector
   check-in, activity timeline, accessibility monitor) that don't
   have a backend contract yet. None of this touches `plan`,
   `emergency`, or `onAskCopilot`.
   ============================================================ */

interface DutyTask {
  id: string;
  title: string;
  sector: string;
  priority: "High" | "Medium" | "Low";
  duration: string;
  done: boolean;
}

interface ActivityEvent {
  id: string;
  label: string;
  detail: string;
  time: string;
  tone: "valid" | "warning" | "critical";
}

type MonitorStatus = "green" | "amber" | "red";

const initialTasks: DutyTask[] = [
  { id: "t1", title: "Verify wheelchair ramp — Gate 4", sector: "Sector C", priority: "High", duration: "10 min", done: false },
  { id: "t2", title: "Crowd flow check — Concourse B", sector: "Sector B", priority: "Medium", duration: "15 min", done: false },
  { id: "t3", title: "Restock first-aid station", sector: "Sector C", priority: "Medium", duration: "8 min", done: true },
  { id: "t4", title: "Escort accessibility guest to seating", sector: "Sector A", priority: "Low", duration: "12 min", done: false },
];

const activityFeed: ActivityEvent[] = [
  { id: "a1", label: "Checked Gate 4", detail: "Sector C · Entry flow normal", time: "3 min ago", tone: "valid" },
  { id: "a2", label: "Crowd update", detail: "Sector B · Concourse density rising", time: "9 min ago", tone: "warning" },
  { id: "a3", label: "Medical support", detail: "Sector C · Assisted first-aid team", time: "21 min ago", tone: "critical" },
  { id: "a4", label: "Accessibility ramp verified", detail: "Sector A · Gate 2 ramp clear", time: "34 min ago", tone: "valid" },
];

const accessibilityMonitor: { label: string; status: MonitorStatus; note: string }[] = [
  { label: "Wheelchair Route", status: "green", note: "Clear, no obstructions" },
  { label: "Lift Status", status: "green", note: "Operational — Gate 2 & 4" },
  { label: "Accessible Entrance", status: "amber", note: "Minor queue, monitor closely" },
  { label: "Emergency Exit", status: "green", note: "Unobstructed" },
];

const toneDotColor: Record<ActivityEvent["tone"], string> = {
  valid: "var(--vco-green)",
  warning: "var(--vco-amber)",
  critical: "var(--vco-red)",
};

const priorityBadgeClass: Record<DutyTask["priority"], string> = {
  High: "vco-badge-critical",
  Medium: "vco-badge-warning",
  Low: "vco-badge-info",
};

const monitorDotClass: Record<MonitorStatus, string> = {
  green: "vco-dot-green",
  amber: "vco-dot-amber",
  red: "vco-dot-red",
};

function Volunteer({ onAskCopilot }: VolunteerProps) {
  // --- unchanged from the original implementation ---
  const [plan, setPlan] = React.useState<{ announcement: string; route: string; volunteer_checklist: string[] } | null>(null);

  // --- new local state for the additional dashboard sections ---
  const [tasks, setTasks] = React.useState<DutyTask[]>(initialTasks);
  const [observationLevel, setObservationLevel] = React.useState<"Normal" | "Busy" | "Severe">("Normal");
  const [sectorNotes, setSectorNotes] = React.useState("");
  const [crowdFlow, setCrowdFlow] = React.useState("Steady");
  const [accessibilityStatus, setAccessibilityStatus] = React.useState("Clear");
  const [wheelchairRoute, setWheelchairRoute] = React.useState("Open");

  const completedCount = tasks.filter((t) => t.done).length;

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function sendTelemetry() {
    alert("Telemetry Check-In Sent");
  }

  return (
    <div className="vco-root">
      {/* ---------------- Header ---------------- */}
      <div className="vco-header">
        <div className="vco-header-main">
          <div className="vco-eyebrow">
            <span className="vco-live-dot" />
            LIVE · STADIUMVERSE OPS
          </div>
          <h1 className="vco-title">Volunteer Coordination &amp; Sector Portal</h1>
          <p className="vco-subtitle">
            Coordinate accessibility, crowd guidance, emergency assistance, and live sector observations.
          </p>
        </div>
        <div className="vco-header-meta">
          <div className="vco-meta-chip">
            <MapPin size={14} />
            <span>Current Sector <strong>Sector C</strong></span>
          </div>
          <div className="vco-meta-chip">
            <Activity size={14} />
            <span>Status <strong className="vco-status-on-duty">On Duty</strong></span>
          </div>
          <div className="vco-meta-chip vco-mono">
            <Clock size={14} />
            <span>Shift 14:00 – 22:00</span>
          </div>
        </div>
        <Radar className="vco-header-radar" size={22} />
      </div>

      {/* ---------------- KPI Cards ---------------- */}
      <section className="vco-grid vco-grid-4">
        <div className="vco-card vco-stat">
          <div className="vco-stat-icon vco-icon-cyan"><MapPin size={20} /></div>
          <div className="vco-stat-label">Assigned Sector</div>
          <div className="vco-stat-value">Sector C</div>
          <div className="vco-stat-sub">Concourse · Gates 3–5</div>
        </div>
        <div className="vco-card vco-stat">
          <div className="vco-stat-icon vco-icon-green"><CheckCircle2 size={20} /></div>
          <div className="vco-stat-label">Tasks Completed</div>
          <div className="vco-stat-value">{completedCount}/{tasks.length}</div>
          <div className="vco-stat-sub">Updated live</div>
        </div>
        <div className="vco-card vco-stat">
          <div className="vco-stat-icon vco-icon-amber"><Users size={20} /></div>
          <div className="vco-stat-label">Active Visitors Assisted</div>
          <div className="vco-stat-value">128</div>
          <div className="vco-stat-sub">+14 in the last hour</div>
        </div>
        <div className="vco-card vco-stat">
          <div className="vco-stat-icon vco-icon-red"><Accessibility size={20} /></div>
          <div className="vco-stat-label">Accessibility Requests</div>
          <div className="vco-stat-value">6</div>
          <div className="vco-stat-sub">2 pending response</div>
        </div>
      </section>

      <section className="vco-grid vco-grid-main">
        {/* ---------------- Left column ---------------- */}
        <div className="vco-col">
          {/* Sector Duty Checklist */}
          <Panel title="Sector Duty Checklist">
            <div className="vco-checklist">
              {tasks.map((task) => (
                <div key={task.id} className={`vco-task ${task.done ? "vco-task-done" : ""}`}>
                  <button className="vco-task-toggle" onClick={() => toggleTask(task.id)} aria-label="Toggle task complete">
                    {task.done ? <CheckCircle2 size={20} className="vco-check-icon" /> : <Circle size={20} className="vco-circle-icon" />}
                  </button>
                  <div className="vco-task-body">
                    <div className="vco-task-title-row">
                      <span className="vco-task-title">{task.title}</span>
                      <span className={`vco-badge ${priorityBadgeClass[task.priority]}`}>{task.priority}</span>
                    </div>
                    <div className="vco-task-meta">
                      <span><MapPin size={12} /> {task.sector}</span>
                      <span className="vco-mono"><Clock size={12} /> {task.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Live Sector Check-In */}
          <Panel title="Live Sector Check-In">
            <div className="vco-field-row">
              <label className="vco-label">Observation Level</label>
              <div className="vco-segmented">
                {(["Normal", "Busy", "Severe"] as const).map((level) => (
                  <button
                    key={level}
                    className={`vco-segment vco-segment-${level.toLowerCase()} ${observationLevel === level ? "vco-segment-active" : ""}`}
                    onClick={() => setObservationLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="vco-field-row">
              <label className="vco-label">Sector Notes</label>
              <textarea
                className="vco-textarea"
                rows={3}
                placeholder="Log any observations for this sector…"
                value={sectorNotes}
                onChange={(e) => setSectorNotes(e.target.value)}
              />
            </div>

            <div className="vco-field-grid">
              <div className="vco-field-row">
                <label className="vco-label">Current Crowd Flow</label>
                <input className="vco-input" value={crowdFlow} onChange={(e) => setCrowdFlow(e.target.value)} />
              </div>
              <div className="vco-field-row">
                <label className="vco-label">Accessibility Status</label>
                <input className="vco-input" value={accessibilityStatus} onChange={(e) => setAccessibilityStatus(e.target.value)} />
              </div>
              <div className="vco-field-row">
                <label className="vco-label">Wheelchair Route</label>
                <input className="vco-input" value={wheelchairRoute} onChange={(e) => setWheelchairRoute(e.target.value)} />
              </div>
            </div>

            <div className="vco-actions-row">
              <button className="vco-button vco-button-primary" onClick={sendTelemetry}>
                <Radio size={15} /> Send Telemetry Check-In
              </button>
            </div>
          </Panel>
        </div>

        {/* ---------------- Right column ---------------- */}
        <div className="vco-col">
          {/* AI Volunteer Assistant (unchanged logic) */}
          <Panel title="Volunteer Assistant">
            <p className="vco-panel-hint">Suggested Actions</p>
            <div className="vco-action-grid">
              <button className="vco-sop-card" onClick={() => onAskCopilot("emergency protocol overview", "volunteer")}>
                <ShieldAlert size={18} className="vco-sop-icon vco-icon-red" />
                <span>Emergency SOP</span>
              </button>
              <button className="vco-sop-card" onClick={() => onAskCopilot("lost child near food court", "volunteer")}>
                <ClipboardList size={18} className="vco-sop-icon vco-icon-amber" />
                <span>Lost Child SOP</span>
              </button>
              <button className="vco-sop-card" onClick={() => emergency("medical").then(setPlan)}>
                <AlertTriangle size={18} className="vco-sop-icon vco-icon-cyan" />
                <span>Medical Assistance</span>
              </button>
              <button className="vco-sop-card" onClick={() => onAskCopilot("accessibility assistance request", "volunteer")}>
                <Accessibility size={18} className="vco-sop-icon vco-icon-green" />
                <span>Accessibility Help</span>
              </button>
            </div>
          </Panel>

          {/* Generated Guidance (unchanged logic) */}
          <Panel title="Generated Guidance">
            {plan ? (
              <div className="vco-fade-in">
                {plan.announcement && <p className="vco-guidance-announcement">{plan.announcement}</p>}
                {plan.route && (
                  <div className="vco-guidance-route">
                    <Navigation size={14} /> {plan.route}
                  </div>
                )}
                <ul className="vco-guidance-list">
                  {plan.volunteer_checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="vco-panel-hint">
                Guidance checklists are generated dynamically based on active stadium scenarios.
              </p>
            )}
          </Panel>

          {/* Accessibility Monitor */}
          <Panel title="Accessibility Monitor">
            <div className="vco-monitor-list">
              {accessibilityMonitor.map((item) => (
                <div key={item.label} className="vco-monitor-item">
                  <span className={`vco-dot ${monitorDotClass[item.status]}`} />
                  <div>
                    <div className="vco-monitor-label">{item.label}</div>
                    <div className="vco-monitor-note">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Volunteer Activity Timeline */}
          <Panel title="Volunteer Activity Timeline">
            <div className="vco-timeline">
              <div className="vco-timeline-line" />
              {activityFeed.map((event) => (
                <div key={event.id} className="vco-timeline-item">
                  <span className="vco-timeline-dot" style={{ background: toneDotColor[event.tone] }} />
                  <div>
                    <div className="vco-timeline-label">{event.label}</div>
                    <div className="vco-timeline-detail">{event.detail}</div>
                    <div className="vco-timeline-time vco-mono">{event.time}</div>
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

export default Volunteer;