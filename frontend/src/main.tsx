import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import {
  Activity,
  BadgeCheck,
  ClipboardList,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { login, me, setAuthToken, type User } from "./api";
import "./styles.css";
import AICopilot from "./components/AICopilot";

const Fan = lazy(() => import("./pages/Fan"));
const SecurityDesk = lazy(() => import("./pages/SecurityDesk"));
const Volunteer = lazy(() => import("./pages/Volunteer"));
const Operations = lazy(() => import("./pages/Operations"));
const Admin = lazy(() => import("./pages/Admin"));
const Copilot = lazy(() => import("./pages/Copilot"));

const demoUsers = [
  ["fan@stadiumverse.ai", "Fan"],
  ["security@stadiumverse.ai", "Security"],
  ["volunteer@stadiumverse.ai", "Volunteer"],
  ["manager@stadiumverse.ai", "Manager"],
  ["admin@stadiumverse.ai", "Admin"],
];

function Shell() {
  const [user, setUser] = React.useState<User | null>(null);

  // Copilot Drawer States
  const [isCopilotOpen, setIsCopilotOpen] = React.useState(false);
  const [copilotTrigger, setCopilotTrigger] = React.useState<{ message: string; persona: string; language?: string } | null>(null);

async function signIn(email: string) {
  try {
    console.log("========== LOGIN START ==========");
    console.log("Signing in as:", email);

    const token = await login(email, "Password123!");
    console.log("Login API Response:", token);

    localStorage.setItem("stadiumverse_token", token.access_token);
    console.log("Token saved to localStorage");

    setAuthToken(token.access_token);
    console.log("Authorization header set");

    const currentUser = await me();
    console.log("Current User:", currentUser);

    setUser(currentUser);

    console.log("========== LOGIN SUCCESS ==========");
    alert("Login Successful");
  } catch (err: any) {
    console.error("========== LOGIN FAILED ==========");
    console.error(err);
    console.error("Status:", err?.response?.status);
    console.error("Response:", err?.response?.data);

    alert("Demo login failed");
  }
}

  React.useEffect(() => {
    const token = localStorage.getItem("stadiumverse_token");
    if (token) {
      setAuthToken(token);
      me().then(setUser).catch(() => localStorage.removeItem("stadiumverse_token"));
    }
  }, []);

  const openCopilotWithMessage = (message: string, persona: string, language = "English") => {
    setCopilotTrigger({ message, persona, language });
    setIsCopilotOpen(true);
  };

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">StadiumVerse AI</p>
          <h1>Smart Stadium Operating System</h1>
        </div>
        <div className="identity">
          {demoUsers.map(([email, label]) => (
<button
  key={email}
  onClick={() => {
    console.log("Clicked:", email);
    signIn(email);
  }}
  className={user?.email === email ? "activeChip" : ""}
>              {label}
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

      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Fan user={user} onAskCopilot={openCopilotWithMessage} />} />
          <Route path="/security" element={<SecurityDesk />} />
          <Route path="/volunteer" element={<Volunteer onAskCopilot={openCopilotWithMessage} />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/copilot" element={<Copilot />} />
        </Routes>
      </Suspense>

      {/* Floating AI Button */}
      <button className="copilot-float-btn" onClick={() => setIsCopilotOpen(true)}>
        <Sparkles size={18} />
        Ask StadiumVerse AI
      </button>

      {/* Premium AI Copilot Drawer */}
      <AICopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        trigger={copilotTrigger}
        currentUser={user}
        clearTrigger={() => setCopilotTrigger(null)}
      />
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  </React.StrictMode>,
);