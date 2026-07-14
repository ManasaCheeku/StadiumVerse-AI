import React from "react";
import {
  AlertTriangle,
  Bot,
  ChevronRight,
  Leaf,
  Mic,
  Paperclip,
  Send,
  Users,
  X,
} from "lucide-react";
import { assist, type AgentResponse, type User } from "../api";

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
      if (!currentUser) {
  alert("Please sign in before using StadiumVerse AI.");
  clearTrigger();
  return;
}
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
          <button
            type="button"
            className="copilot-close"
            onClick={onClose}
            aria-label="Close AI Copilot"
            title="Close AI Copilot"
          >
            <X size={20} />
          </button>
        </div>

        {/* Selectors */}
        <div className="copilot-selectors">
          <div className="copilot-field">
            <label htmlFor="persona-select">Persona</label>
            <select
              id="persona-select"
              name="persona"
              aria-label="Select persona"
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
            <label htmlFor="language-select">Language</label>
            <select
              id="language-select"
              name="language"
              aria-label="Select language"
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

export default AICopilot;