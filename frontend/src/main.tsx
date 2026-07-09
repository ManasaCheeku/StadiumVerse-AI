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
  Sparkles,
  Send,
  Mic,
  Paperclip,
  X,
  Bot,
  Leaf,
  ChevronRight,
  Clock,
  CloudSun,
  Car,
  Bus,
  MapPin,
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

// Global interface for Chat Message
interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  persona: string;
  language: string;
  confidence?: number;
  agentName?: string;
  badges?: {
    accessibility?: boolean;
    emergency?: boolean;
    sustainability?: boolean;
  };
}

function Shell() {
  const [user, setUser] = React.useState<User | null>(null);
  
  // Copilot Drawer States
  const [isCopilotOpen, setIsCopilotOpen] = React.useState(false);
  const [copilotTrigger, setCopilotTrigger] = React.useState<{ message: string; persona: string; language?: string } | null>(null);

  async function signIn(email: string) {
    const token = await login(email, "Password123!");
    localStorage.setItem("stadiumverse_token", token.access_token);
    setAuthToken(token.access_token);
    const currentUser = await me();
    setUser(currentUser);
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
        <Route path="/" element={<Fan user={user} onAskCopilot={openCopilotWithMessage} />} />
        <Route path="/security" element={<SecurityDesk />} />
        <Route path="/volunteer" element={<Volunteer onAskCopilot={openCopilotWithMessage} />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

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

/* ==========================================================================
   AI COPILOT COMPONENT
   ========================================================================== */
interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: { message: string; persona: string; language?: string } | null;
  currentUser: User | null;
  clearTrigger: () => void;
}

function AICopilot({ isOpen, onClose, trigger, currentUser, clearTrigger }: AICopilotProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [selectedPersona, setSelectedPersona] = React.useState("fan");
  const [selectedLanguage, setSelectedLanguage] = React.useState("English");
  
  // Animation / Status states
  const [isThinking, setIsThinking] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [uploadOverlay, setUploadOverlay] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Sync persona with active demo user
  React.useEffect(() => {
    if (currentUser) {
      const roleMap: Record<string, string> = {
        fan: "fan",
        volunteer: "volunteer",
        security: "security",
        manager: "manager",
        admin: "manager", // admin maps to manager persona for copilot
      };
      setSelectedPersona(roleMap[currentUser.role] || "fan");
    }
  }, [currentUser]);

  // Handle outside trigger button clicks
  React.useEffect(() => {
    if (trigger) {
      setSelectedPersona(trigger.persona);
      if (trigger.language) setSelectedLanguage(trigger.language);
      
      // Auto-submit the triggered message
      sendMessage(trigger.message, trigger.persona, trigger.language || "English");
      clearTrigger();
    }
  }, [trigger]);

  // Scroll to bottom of chat
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Normalize AI headers to display blocks nicely
  const parseAISections = (text: string) => {
    const sections: Record<string, string> = {
      summary: "",
      action: "",
      reasoning: "",
      alternative: "",
      accessibility: "",
      safety: ""
    };
    
    // Split by markdown headers
    const lines = text.split("\n");
    let currentKey = "summary";
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("###")) {
        const headerText = trimmed.toLowerCase();
        if (headerText.includes("summary") || headerText.includes("सारांश") || headerText.includes("ಸಾರಾಂಶ") || headerText.includes("resumen") || headerText.includes("résumé")) {
          currentKey = "summary";
        } else if (headerText.includes("action") || headerText.includes("कार्रवाई") || headerText.includes("ಕ್ರಮ") || headerText.includes("acción") || headerText.includes("recommandée")) {
          currentKey = "action";
        } else if (headerText.includes("reasoning") || headerText.includes("तर्क") || headerText.includes("ಕಾರಣ") || headerText.includes("razonamiento") || headerText.includes("raisonnement")) {
          currentKey = "reasoning";
        } else if (headerText.includes("alternative") || headerText.includes("ವैकल्पिक") || headerText.includes("ಪರ್ಯಾಯ") || headerText.includes("alternativa") || headerText.includes("alternative")) {
          currentKey = "alternative";
        } else if (headerText.includes("accessibility") || headerText.includes("अभिगम्यता") || headerText.includes("ಪ್ರವೇಶಾವಕಾಶ") || headerText.includes("accesibilidad") || headerText.includes("accessibilité")) {
          currentKey = "accessibility";
        } else if (headerText.includes("safety") || headerText.includes("सुरक्षा") || headerText.includes("ಸುರಕ್ಷತಾ") || headerText.includes("seguridad") || headerText.includes("securité")) {
          currentKey = "safety";
        }
      } else if (trimmed) {
        sections[currentKey] = (sections[currentKey] || "") + line + "\n";
      }
    }
    
    // If no sections parsed, use whole text as summary
    if (!sections.summary && !sections.action && !sections.reasoning) {
      sections.summary = text;
    }
    
    return sections;
  };

  const detectBadges = (sections: Record<string, string>, rawText: string) => {
    const hasAccessibility = !!sections.accessibility && !sections.accessibility.toLowerCase().includes("not applicable");
    const hasEmergency = !!sections.safety && !sections.safety.toLowerCase().includes("not applicable");
    
    const sustainKeywords = ["water refill", "reusable", "public transport", "metro", "bus", "train", "sustainability", "eco", "waste segregation", "bottle", "paperless"];
    const hasSustainability = sustainKeywords.some(kw => rawText.toLowerCase().includes(kw));

    return {
      accessibility: hasAccessibility,
      emergency: hasEmergency,
      sustainability: hasSustainability
    };
  };

  const sendMessage = async (messageText: string, persona: string, language: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date(),
      persona,
      language
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsThinking(true);

    try {
      const response = await assist(persona, messageText, language);
      const parsed = parseAISections(response.answer);
      const badges = detectBadges(parsed, response.answer);

      // Add AI response
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.answer,
        timestamp: new Date(),
        persona,
        language,
        confidence: response.confidence,
        agentName: response.agent,
        badges
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "### Summary\nSorry, StadiumVerse AI encountered an error processing your query. Please check your network connection.",
        timestamp: new Date(),
        persona,
        language
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = () => {
    sendMessage(inputValue, selectedPersona, selectedLanguage);
  };

  // Simulated Voice Input
  const triggerVoiceInput = () => {
    if (isListening) return;
    setIsListening(true);
    setTimeout(() => {
      setInputValue("Where is the nearest water refill station?");
      setIsListening(false);
    }, 2200);
  };

  // Simulated Ticket Upload
  const triggerTicketUpload = () => {
    if (uploadOverlay) return;
    setUploadOverlay("Scanning Secure Ticket QR...");
    setTimeout(() => {
      setUploadOverlay("Ticket scan completed!");
      setInputValue("Analyze ticket QR code for Gate 5 seat details");
      setTimeout(() => setUploadOverlay(""), 1200);
    }, 1800);
  };

  // Suggested Prompts by Persona
  const getSuggestions = () => {
    if (selectedPersona === "volunteer") {
      return [
        { text: "📋 View Lost Child SOP checklist", msg: "lost child near food court" },
        { text: "🚨 Show medical emergency evacuation SOP", msg: "medical emergency near gate 5" },
        { text: "🚪 Gate 3 queue congestion checklist", msg: "Gate 3 queue is congested. What is the alternate gate SOP?" }
      ];
    }
    if (selectedPersona === "security") {
      return [
        { text: "👜 Report unattended bag at Section A12", msg: "report unattended bag at Section A12" },
        { text: "🔒 Report threat security queue breach", msg: "security breach at Gate 7 queue" },
        { text: "⚠️ Guide for duplicate ticket scans", msg: "what is the SOP for duplicate QR scan alert?" }
      ];
    }
    if (selectedPersona === "manager" || selectedPersona === "organizer") {
      return [
        { text: "📊 Analyze gate crowd bottlenecks", msg: "which gates are currently congested? Show alternative routing." },
        { text: "🚗 Show parking capacity and shuttle metrics", msg: "operations update: show parking utilization." },
        { text: "🌿 Recommend sustainability actions", msg: "sustainability guidelines for match day" }
      ];
    }
    // Fan persona default
    return [
      { text: "🍔 Best nearby food with short queue", msg: "Find nearby food" },
      { text: "♿ Show accessible route from Gate 5", msg: "wheelchair accessible route from Gate 5 to Section B20" },
      { text: "🚗 Show parking and shuttle options", msg: "Where is the best parking and transit options?" },
      { text: "🌱 Where are the water refill stations?", msg: "sustainability refill stations" }
    ];
  };

  return (
    <div className={`copilot-drawer ${isOpen ? "open" : ""}`}>
      {/* Header */}
      <div className="copilot-header">
        <div className="copilot-header-top">
          <div className="copilot-brand">
            <Bot size={24} className="copilot-logo" />
            <div>
              <h2>StadiumVerse AI</h2>
              <span className="copilot-status">Operations Mode Active</span>
            </div>
          </div>
          <button className="copilot-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Selectors */}
        <div className="copilot-selectors">
          <div className="copilot-field">
            <label>Persona</label>
            <select 
              value={selectedPersona} 
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="copilot-select"
            >
              <option value="fan">Football Fan</option>
              <option value="volunteer">Volunteer</option>
              <option value="security">Security Officer</option>
              <option value="manager">Ops Manager</option>
              <option value="organizer">Event Organizer</option>
            </select>
          </div>
          <div className="copilot-field">
            <label>Language</label>
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="copilot-select"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="copilot-history">
        {messages.length === 0 ? (
          <div className="copilot-welcome">
            <div className="copilot-welcome-icon">
              <Bot size={36} />
            </div>
            <div className="copilot-welcome-text">
              <h3>StadiumVerse Copilot</h3>
              <p>Generative AI Assistant for the FIFA World Cup 2026. Get crowd advice, gate directions, SOP templates, accessibility, and emergency support instantly.</p>
            </div>
            <div className="copilot-suggestions">
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#53645e", margin: "10px 0 5px" }}>Suggested Prompts</p>
              {getSuggestions().map((sug, i) => (
                <div 
                  key={i} 
                  className="copilot-suggestion-card"
                  onClick={() => sendMessage(sug.msg, selectedPersona, selectedLanguage)}
                >
                  <span>{sug.text}</span>
                  <ChevronRight size={14} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const parsed = parseAISections(msg.text);
            const showAccessibility = msg.badges?.accessibility;
            const showEmergency = msg.badges?.emergency;
            const showSustainability = msg.badges?.sustainability;

            return (
              <div key={msg.id} className={`copilot-msg ${msg.sender}`}>
                {/* Badges row — always shown for AI messages */}
                {msg.sender === "ai" && (
                  <div className="copilot-badges">
                    {showEmergency && (
                      <span className="copilot-badge emergency">
                        <AlertTriangle size={12} /> EMERGENCY ALERT
                      </span>
                    )}
                    {showAccessibility && (
                      <span className="copilot-badge accessibility">
                        <Users size={12} /> ACCESSIBLE ROUTE
                      </span>
                    )}
                    {showSustainability && (
                      <span className="copilot-badge sustainability">
                        <Leaf size={12} /> ECO-FRIENDLY CHOICE
                      </span>
                    )}
                  </div>
                )}

                <div className="copilot-msg-bubble">
                  {msg.sender === "user" ? (
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  ) : (
                    <div>
                      {/* 1 · SUMMARY */}
                      {parsed.summary && (
                        <div className="ai-section-card summary">
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{parsed.summary}</p>
                        </div>
                      )}

                      {/* Incident report block */}
                      {msg.text.includes("[Incident") && (
                        <div className="ai-section-card" style={{ borderLeftColor: "#d06f3c", background: "#fffaf7" }}>
                          <h4 style={{ color: "#d06f3c" }}>Incident Summary Logs</h4>
                          <pre style={{ fontSize: "0.75rem", background: "#17211d", color: "#f5fbf7", padding: "10px", margin: "6px 0 0 0", maxHeight: "250px" }}>
                            {msg.text.match(/\[Incident[\s\S]*?(?=(?:###|$))/)?.[0] || msg.text}
                          </pre>
                        </div>
                      )}

                      {/* 2 · RECOMMENDED ACTION */}
                      {parsed.action && (
                        <div className="ai-section-card action">
                          <h4>Recommended Action</h4>
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{parsed.action}</p>
                        </div>
                      )}

                      {/* 3 · REASONING */}
                      {parsed.reasoning && (
                        <div className="ai-section-card reasoning">
                          <h4>Reasoning</h4>
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{parsed.reasoning}</p>
                        </div>
                      )}

                      {/* 4 · ALTERNATIVE */}
                      {parsed.alternative && (
                        <div className="ai-section-card alternative">
                          <h4>Alternative Option</h4>
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{parsed.alternative}</p>
                        </div>
                      )}

                      {/* 5 · ACCESSIBILITY — always show if present, not gated on badge */}
                      {parsed.accessibility && (
                        <div className="ai-section-card accessibility">
                          <h4>Accessibility Guidance</h4>
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{parsed.accessibility}</p>
                        </div>
                      )}

                      {/* 6 · SAFETY — always show if present */}
                      {parsed.safety && (
                        <div className="ai-section-card safety">
                          <h4>Safety Advice</h4>
                          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{parsed.safety}</p>
                        </div>
                      )}

                      {/* 7 · CONFIDENCE BAR */}
                      {msg.confidence !== undefined && (
                        <div className="ai-confidence">
                          <div className="ai-confidence-label">
                            <span>{msg.agentName ?? "Copilot"}</span>
                            <span className="ai-confidence-pct">{Math.round(msg.confidence * 100)}% confidence</span>
                          </div>
                          <div className="ai-confidence-track">
                            <div
                              className="ai-confidence-fill"
                              style={{ width: `${Math.round(msg.confidence * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="copilot-msg-meta">
                  <span>{msg.sender === "user" ? "You" : "Copilot"}</span>
                  <span>·</span>
                  <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })
        )}
        
        {/* Thinking Indicator */}
        {isThinking && (
          <div className="copilot-thinking">
            <span>Thinking</span>
            <div className="thinking-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Simulated Indicators */}
      {isListening && (
        <div className="copilot-micro-overlay">
          🎙️ Listening... speak your query.
        </div>
      )}
      {uploadOverlay && (
        <div className="copilot-micro-overlay">
          📎 {uploadOverlay}
        </div>
      )}

      {/* Input Form */}
      <div className="copilot-input-area">
        <div className="copilot-input-row">
          <button 
            className="copilot-action-btn" 
            title="Upload digital ticket"
            onClick={triggerTicketUpload}
          >
            <Paperclip size={18} />
          </button>
          
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type message, report issue, ask gate SOP..."
            className="copilot-input"
            disabled={isThinking}
          />
          
          <button 
            className={`copilot-action-btn ${isListening ? "animate-pulse-mic" : ""}`}
            title="Voice assistance"
            onClick={triggerVoiceInput}
          >
            <Mic size={18} />
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button 
            className="copilot-send-btn" 
            onClick={handleSend}
            disabled={!inputValue.trim() || isThinking}
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

interface MatchContextCardProps {
  ticket: Ticket | null;
}

function MatchContextCard({ ticket }: MatchContextCardProps) {
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

interface FanProps {
  user: User | null;
  onAskCopilot: (msg: string, persona: string, lang?: string) => void;
}

const QUICK_ACTIONS = [
  { id: "gate",      icon: "MapPin",       label: "Find My Gate",         hint: "Navigate to your gate",      prompt: "How do I find my gate? I have a ticket for Gate 5 at Harbor Field.",                           persona: "fan" },
  { id: "access",   icon: "Users",        label: "Accessible Route",     hint: "Wheelchair & mobility routes", prompt: "I need a wheelchair-accessible route from the main entrance to Section B20.",                   persona: "fan" },
  { id: "washroom", icon: "Droplets",      label: "Nearest Washroom",     hint: "Find restrooms quickly",      prompt: "Where is the nearest restroom from Concourse B?",                                            persona: "fan" },
  { id: "food",     icon: "Utensils",      label: "Find Food",            hint: "Fastest concessions queue",   prompt: "Which food court has the shortest queue right now?",                                          persona: "fan" },
  { id: "parking",  icon: "Car",          label: "Parking",              hint: "Parking slots & directions",  prompt: "Which parking zone has the most available spaces and how do I get there?",                      persona: "fan" },
  { id: "transit",  icon: "Bus",          label: "Transport",            hint: "Bus, rail & shuttle status",  prompt: "What public transport options are available from the stadium after the match?",                 persona: "fan" },
  { id: "lost",     icon: "Search",        label: "Lost & Found",         hint: "Report or find lost items",   prompt: "I lost my bag near Section A12. How do I report it and where is the Lost and Found desk?",       persona: "fan" },
  { id: "emergency",icon: "AlertTriangle", label: "Emergency",            hint: "Medical & safety support",    prompt: "medical emergency near gate 5",                                                              persona: "fan" },
  { id: "translate",icon: "Languages",    label: "Translate Announcement",hint: "Multilingual stadium help",   prompt: "Please translate the latest stadium announcement into Hindi.",                               persona: "fan" },
  { id: "rules",    icon: "BookOpen",      label: "Stadium Rules",        hint: "Allowed & prohibited items",  prompt: "What are the stadium rules? What items are prohibited at Harbor Field for the FIFA World Cup?",   persona: "fan" },
];

const QA_ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Users, Car, Bus, Languages, AlertTriangle,
  Droplets: ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
  ),
  Utensils: ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
  ),
  Search: ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  BookOpen: ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
};

interface QuickActionsProps {
  onAskCopilot: (msg: string, persona: string, lang?: string) => void;
  isLoggedIn: boolean;
}

function QuickActions({ onAskCopilot, isLoggedIn }: QuickActionsProps) {
  return (
    <div className="quick-actions-panel">
      <p className="eyebrow">Quick Actions</p>
      <div className="quick-actions-grid">
        {QUICK_ACTIONS.map((action) => {
          const Icon = QA_ICON_MAP[action.icon] ?? MapPin;
          return (
            <button
              key={action.id}
              id={`quick-action-${action.id}`}
              className="quick-action-card"
              disabled={!isLoggedIn}
              onClick={() => onAskCopilot(action.prompt, action.persona)}
            >
              <Icon size={22} />
              <div>
                <strong>{action.label}</strong>
                <span style={{ display: "block", marginTop: "2px" }}>{action.hint}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
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
      <QuickActions onAskCopilot={onAskCopilot} isLoggedIn={!!user} />

      <div className="heroPanel">
        <p className="eyebrow">Fan Journey</p>
        <h2>Arrival, ticketing, navigation, and multilingual help in one stadium mode.</h2>
        <div className="buttonRow">
          <button disabled={!user} onClick={() => issueTicket().then(setTicket)}><QrCode size={18} />Generate QR Ticket</button>
          <button disabled={!user} onClick={() => routeTo("Gate 5", "Emergency Exit 3", "wheelchair").then(setRoute)}><MapPinned size={18} />Accessible Route</button>
          <button disabled={!user} onClick={() => onAskCopilot("Find nearby food", "fan", "Hindi")}><Languages size={18} />Ask AI (Hindi)</button>
        </div>
      </div>
      <div className="panelStack">
        <Panel title="Digital Ticket">{ticket ? <CodeBlock text={ticket.qr_payload} /> : <p>Encrypted QR appears after ticket generation.</p>}</Panel>
        <Panel title="Indoor Navigation">{route ? <RouteView route={route} /> : <p>Routes adapt for wheelchair users, seniors, and families.</p>}</Panel>
        <Panel title="Fan Agent"><p>Use the floating Copilot at the bottom right to ask about gates, seats, food, restrooms, parking, or safety procedures.</p></Panel>
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

interface VolunteerProps {
  onAskCopilot: (msg: string, persona: string, lang?: string) => void;
}

function Volunteer({ onAskCopilot }: VolunteerProps) {
  const [plan, setPlan] = React.useState<{ announcement: string; route: string; volunteer_checklist: string[] } | null>(null);
  return (
    <section className="workspace two">
      <Panel title="Volunteer Assistant">
        <button onClick={() => onAskCopilot("lost child near food court", "volunteer")}><ClipboardList size={18} />Lost Child SOP</button>
        <button onClick={() => emergency("medical").then(setPlan)}><AlertTriangle size={18} />Medical Emergency</button>
      </Panel>
      <Panel title="Generated Guidance">
        {plan ? <ul>{plan.volunteer_checklist.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Guidance checklists are generated dynamically based on active stadium scenarios.</p>}
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
