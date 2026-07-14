import React from "react";
import Panel from "../components/Panel";
import useAsync from "../hooks/useAsync";
import { auditLogs } from "../api";

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

export default Admin;