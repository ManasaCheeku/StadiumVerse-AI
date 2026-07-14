import React from "react";
import { QrCode } from "lucide-react";
import Panel from "../components/Panel";
import { scanTicket, type ScanResponse } from "../api";

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

export default SecurityDesk;