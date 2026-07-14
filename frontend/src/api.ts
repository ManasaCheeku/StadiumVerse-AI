import axios from "axios";


export type Venue = {
  id: string;
  name: string;
  city: string;
  capacity: number;
  surface: string;
  roof: string;
  transit_score: number;
  home_advantage: number;
  energy_index: number;
};

export type MatchContext = {
  opponent: string;
  expected_attendance: number;
  weather: string;
  kickoff_window: string;
};

export type Insight = {
  title: string;
  summary: string;
  confidence: number;
};

export type VenueInsights = {
  venue: Venue;
  context: MatchContext;
  insights: Insight[];
  recommendations: string[];
};
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
});

// --- temporary diagnostic: remove once auth bug is confirmed fixed ---
api.interceptors.request.use((config) => {
  console.log(
    "[api request]",
    config.method?.toUpperCase(),
    config.url,
    "Authorization:",
    config.headers?.Authorization ?? "(none)"
  );
  return config;
});
// -----------------------------------------------------------------------

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await api.get<T>(path);
  return response.data;
}

async function postJson<T>(path: string, data: unknown): Promise<T> {
  const response = await api.post<T>(path, data);
  return response.data;
}

export function fetchVenues() {
  return getJson<Venue[]>("/venues");
}

export function fetchInsights(venueId: string) {
  return getJson<VenueInsights>(`/venues/${venueId}/insights`);
}
export default api;

export type User = { email: string; full_name: string; role: string };
export type TokenResponse = { access_token: string; token_type: string; role: string };
export type Ticket = { ticket_code: string; qr_payload: string; gate: string; seat: string; stadium_id: string };
export type ScanResponse = { status: string; ticket_code?: string; message: string; recommended_action: string; risk_score: number };
export type RouteResponse = { route: string[]; directions: string[]; estimated_minutes: number; accessibility_notes: string[] };
export type AgentResponse = { agent: string; answer: string; actions: string[]; confidence: number; language: string };
export type OperationsSnapshot = {
  kpis: { attendance: number; entry_rate_per_min: number; incidents: number; medical_alerts: number };
  parking: Record<string, number>;
  food_courts: Record<string, number>;
  volunteers: Array<{ name: string; zone: string; status: string }>;
  security_incidents: Array<{ type: string; zone: string; severity: string }>;
  crowd: { density: number; prediction: string; gate_occupancy: Array<{ gate: string; occupancy: number; queue: number }>; recommendations: string[] };
};

export const login = async (email: string, password: string) => {
  console.log("========== LOGIN API ==========");
  console.log("Calling /auth/login");
  console.log("Email:", email);

  const response = await postJson<TokenResponse>("/auth/login", {
    email,
    password,
  });

  console.log("Login Response:", response);

  return response;
};export const me = () => getJson<User>("/me");
export const issueTicket = () => postJson<Ticket>("/tickets", {});
export const scanTicket = (qr_payload: string) => postJson<ScanResponse>("/security/scan", { qr_payload, stadium_id: "atlas-dome", match_id: "final-2026" });
export const routeTo = (start: string, destination: string, accessibility = "standard") => postJson<RouteResponse>("/navigation/route", { start, destination, accessibility });
export const assist = (persona: string, message: string, language = "English") => postJson<AgentResponse>("/ai/assist", { persona, message, language });
export const operations = () => getJson<OperationsSnapshot>("/operations/dashboard");
export const emergency = (incident: string) => getJson<{ announcement: string; route: string; volunteer_checklist: string[] }>(`/emergency/${incident}`);
export const auditLogs = () => getJson<Array<{ actor: string; action: string; detail: string; risk_score: number; created_at: string }>>("/admin/audit-logs");