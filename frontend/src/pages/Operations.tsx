import React from "react";
import { Activity, AlertTriangle, Shield, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Kpi from "../components/Kpi";
import Panel from "../components/Panel";
import Chart from "../components/Chart";
import useAsync from "../hooks/useAsync";
import { operations, type OperationsSnapshot } from "../api";

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

export default Operations;