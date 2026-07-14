import React from "react";

interface PanelProps {
  title: string;
  children: React.ReactNode;
}

export default function Panel({ title, children }: PanelProps) {
  return (
    <section className="panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}