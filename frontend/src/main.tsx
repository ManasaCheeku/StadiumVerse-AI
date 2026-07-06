import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  ClipboardList,
  Languages,
  MapPinned,
  QrCode,
  Shield,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  assist,
  auditLogs,
  emergency,
  fetchVenues,
  issueTicket,
  login,
  me,
  operations,
  routeTo,
  scanTicket,
  setAuthToken,
  type AgentResponse,
  type OperationsSnapshot,
  type RouteResponse,
  type ScanResponse,
  type Ticket,
  type User,
  type Venue,
} from "./api";
import "./styles.css";

const demoUsers = [
  ["fan@stadiumverse.ai", "Fan"],
  ["security@stadiumverse.ai", "Security"],
  ["volunteer@stadiumverse.ai", "Volunteer"],
  ["manager@stadiumverse.ai", "Manager"],
  ["admin@stadiumverse.ai", "Admin"],
];

function useAsync<T>(loader: () => Promise<T>, deps: React.DependencyList) {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState("");
  React.useEffect(() => {
    let mounted = true;
    loader()
      .then((value) => mounted && setData(value))
      .catch(() => mounted && setError("Unable to load this workspace."))
    return () => {
      mounted = false;
    };
  }, deps);
  return { data, error };
}

function Shell() {
  const [user, setUser] = React.useState<User | null>(null);

  async function signIn(email: string) {
    const token = await login(email, "Password123!");
    localStorage.setItem("stadiumverse_token", token.access_token);
    setAuthToken(token.access_token);
    setUser(await me());
  }

  React.useEffect(() => {
    const token = localStorage.getItem("stadiumverse_token");
    if (token) {
      setAuthToken(token);
      me().then(setUser).catch(() => localStorage.removeItem("stadiumverse_token"));
    }
  }, []);

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">StadiumVerse AI</p>
          <h1>Smart Stadium Operating System</h1>
        </div>
        <div className="identity">
          {demoUsers.map(([email, label]) => (
            <button key={email} onClick={() => signIn(email)} className={user?.email === email ? "activeChip" : ""}>
              {label}
            </button>
          ))}
        </div>
      </header>
      <nav className="navRail" aria-label="Primary">
        <NavLink to="/"><Users size={18} />Fan</NavLink>
        <NavLink to="/security"><Shield size={18} />Security</NavLink>
        <NavLink to="/volunteer"><ClipboardList size={18} />Volunteer</NavLink>
        <NavLink to="/operations"><Activity size={18} />Operations</NavLink>
        <NavLink to="/admin"><BadgeCheck size={18} />Admin</NavLink>
      </nav>
      <section className="statusLine">{user ? `${user.full_name} signed in as ${user.role}` : "Choose a demo role to unlock secured workflows."}</section>
      <Routes>
        <Route path="/" element={<Fan user={user} />} />
        <Route path="/security" element={<SecurityDesk />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </main>
  );
}

function Fan({ user }: { user: User | null }) {
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const [route, setRoute] = React.useState<RouteResponse | null>(null);
  const [agent, setAgent] = React.useState<AgentResponse | null>(null);
  const { data: venues } = useAsync<Venue[]>(fetchVenues, []);

  return (
    <section className="workspace two">
      <div className="heroPanel">
        <p className="eyebrow">Fan Journey</p>
        <h2>Arrival, ticketing, navigation, and multilingual help in one stadium mode.</h2>
        <div className="buttonRow">
          <button disabled={!user} onClick={() => issueTicket().then(setTicket)}><QrCode size={18} />Generate QR Ticket</button>
          <button disabled={!user} onClick={() => routeTo("Gate 5", "Emergency Exit 3", "wheelchair").then(setRoute)}><MapPinned size={18} />Accessible Route</button>
          <button disabled={!user} onClick={() => assist("fan", "Find nearby food in Hindi", "Hindi").then(setAgent)}><Languages size={18} />Ask AI</button>
        </div>
      </div>
      <div className="panelStack">
        <Panel title="Digital Ticket">{ticket ? <CodeBlock text={ticket.qr_payload} /> : <p>Encrypted QR appears after ticket generation.</p>}</Panel>
        <Panel title="Indoor Navigation">{route ? <RouteView route={route} /> : <p>Routes adapt for wheelchair users, seniors, and families.</p>}</Panel>
        <Panel title="Fan Agent">{agent ? <AgentView agent={agent} /> : <p>Ask for gates, seats, food, restrooms, parking, or exits.</p>}</Panel>
        <Panel title="Tournament Venues"><p>{venues?.map((venue) => venue.name).join(" / ")}</p></Panel>
      </div>
    </section>
  );
}

function SecurityDesk() {
  const [qr, setQr] = React.useState("");
  const [result, setResult] = React.useState<ScanResponse | null>(null);
  return (
    <section className="workspace two">
      <Panel title="QR Validation">
        <textarea value={qr} onChange={(event) => setQr(event.target.value)} placeholder="Paste fan QR payload" />
        <button onClick={() => scanTicket(qr).then(setResult)}><QrCode size={18} />Scan Ticket</button>
      </Panel>
      <Panel title="Threat Assessment">
        {result ? <div className={`verdict ${result.status}`}>{result.message}<strong>Risk {Math.round(result.risk_score * 100)}%</strong><span>{result.recommended_action}</span></div> : <p>Validates authenticity, match, stadium, duplicate scans, and fraud attempts.</p>}
      </Panel>
    </section>
  );
}

function Volunteer() {
  const [response, setResponse] = React.useState<AgentResponse | null>(null);
  const [plan, setPlan] = React.useState<{ announcement: string; route: string; volunteer_checklist: string[] } | null>(null);
  return (
    <section className="workspace two">
      <Panel title="Volunteer Assistant">
        <button onClick={() => assist("volunteer", "lost child near food court").then(setResponse)}><ClipboardList size={18} />Lost Child SOP</button>
        <button onClick={() => emergency("medical").then(setPlan)}><AlertTriangle size={18} />Medical Emergency</button>
      </Panel>
      <Panel title="Generated Guidance">
        {response ? <AgentView agent={response} /> : null}
        {plan ? <ul>{plan.volunteer_checklist.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      </Panel>
    </section>
  );
}

function Operations() {
  const { data, error } = useAsync<OperationsSnapshot>(operations, []);
  if (error) return <section className="notice">{error}</section>;
  if (!data) return <section className="notice">Loading operations intelligence...</section>;
  const parking = Object.entries(data.parking).map(([name, value]) => ({ name, value }));
  return (
    <section className="dashboardGrid">
      <Kpi icon={Users} label="Attendance" value={data.kpis.attendance.toLocaleString()} />
      <Kpi icon={Activity} label="Entry/min" value={String(data.kpis.entry_rate_per_min)} />
      <Kpi icon={Shield} label="Incidents" value={String(data.kpis.incidents)} />
      <Kpi icon={AlertTriangle} label="Medical" value={String(data.kpis.medical_alerts)} />
      <Panel title="Gate Occupancy"><Chart data={data.crowd.gate_occupancy} /></Panel>
      <Panel title="Parking Utilization"><ResponsiveContainer height={220}><BarChart data={parking}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#1f5b4e" /></BarChart></ResponsiveContainer></Panel>
      <Panel title="AI Recommendations"><ul>{data.crowd.recommendations.map((item) => <li key={item}>{item}</li>)}</ul></Panel>
      <Panel title="Security Incidents"><ul>{data.security_incidents.map((item) => <li key={item.type}>{item.type} at {item.zone} · {item.severity}</li>)}</ul></Panel>
    </section>
  );
}

function Admin() {
  const { data, error } = useAsync(auditLogs, []);
  return (
    <section className="workspace">
      <Panel title="Audit Logs">
        {error ? <p>{error}</p> : null}
        <div className="table">
          {data?.map((log) => (
            <div className="row" key={`${log.created_at}-${log.action}`}>
              <span>{log.action}</span><span>{log.actor}</span><span>{Math.round(log.risk_score * 100)}%</span>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel"><h3>{title}</h3>{children}</section>;
}

function Kpi({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <div className="kpi"><Icon size={20} /><span>{label}</span><strong>{value}</strong></div>;
}

function Chart({ data }: { data: OperationsSnapshot["crowd"]["gate_occupancy"] }) {
  return <ResponsiveContainer height={220}><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="gate" /><YAxis /><Tooltip /><Line dataKey="occupancy" stroke="#1f5b4e" strokeWidth={3} /><Line dataKey="queue" stroke="#d06f3c" strokeWidth={3} /></LineChart></ResponsiveContainer>;
}

function RouteView({ route }: { route: RouteResponse }) {
  return <div><p>{route.route.join(" -> ")}</p><small>{route.estimated_minutes} minutes · {route.accessibility_notes[0]}</small></div>;
}

function AgentView({ agent }: { agent: AgentResponse }) {
  return <div><strong>{agent.agent}</strong><p>{agent.answer}</p><ul>{agent.actions.map((action) => <li key={action}>{action}</li>)}</ul></div>;
}

function CodeBlock({ text }: { text: string }) {
  return <pre>{text}</pre>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  </React.StrictMode>,
);
