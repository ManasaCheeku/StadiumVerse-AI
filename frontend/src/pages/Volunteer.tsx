import React from "react";
import { AlertTriangle, ClipboardList } from "lucide-react";
import Panel from "../components/Panel";
import { emergency } from "../api";

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

export default Volunteer;