import React from "react";
import { AlertTriangle, Bus, Car, Languages, MapPin, Users } from "lucide-react";

const QUICK_ACTIONS = [
  { id: "gate", icon: "MapPin", label: "Find My Gate", hint: "Navigate to your gate", prompt: "How do I find my gate? I have a ticket for Gate 5 at Harbor Field.", persona: "fan" },
  { id: "access", icon: "Users", label: "Accessible Route", hint: "Wheelchair & mobility routes", prompt: "I need a wheelchair-accessible route from the main entrance to Section B20.", persona: "fan" },
  { id: "washroom", icon: "Droplets", label: "Nearest Washroom", hint: "Find restrooms quickly", prompt: "Where is the nearest restroom from Concourse B?", persona: "fan" },
  { id: "food", icon: "Utensils", label: "Find Food", hint: "Fastest concessions queue", prompt: "Which food court has the shortest queue right now?", persona: "fan" },
  { id: "parking", icon: "Car", label: "Parking", hint: "Parking slots & directions", prompt: "Which parking zone has the most available spaces and how do I get there?", persona: "fan" },
  { id: "transit", icon: "Bus", label: "Transport", hint: "Bus, rail & shuttle status", prompt: "What public transport options are available from the stadium after the match?", persona: "fan" },
  { id: "lost", icon: "Search", label: "Lost & Found", hint: "Report or find lost items", prompt: "I lost my bag near Section A12. How do I report it and where is the Lost and Found desk?", persona: "fan" },
  { id: "emergency", icon: "AlertTriangle", label: "Emergency", hint: "Medical & safety support", prompt: "medical emergency near gate 5", persona: "fan" },
  { id: "translate", icon: "Languages", label: "Translate Announcement", hint: "Multilingual stadium help", prompt: "Please translate the latest stadium announcement into Hindi.", persona: "fan" },
  { id: "rules", icon: "BookOpen", label: "Stadium Rules", hint: "Allowed & prohibited items", prompt: "What are the stadium rules? What items are prohibited at Harbor Field for the FIFA World Cup?", persona: "fan" },
];

const QA_ICON_MAP: Record<string, React.ElementType> = {
  MapPin, Users, Car, Bus, Languages, AlertTriangle,
  Droplets: ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>
  ),
  Utensils: ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
  ),
  Search: ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
  ),
  BookOpen: ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
  ),
};

interface QuickActionsProps {
  onAskCopilot?: (msg: string, persona: string, lang?: string) => void;
  isLoggedIn?: boolean;
}

function QuickActions({
  onAskCopilot = () => {},
  isLoggedIn = true,
}: QuickActionsProps) {  return (
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

export { QUICK_ACTIONS, QA_ICON_MAP };
export default QuickActions;