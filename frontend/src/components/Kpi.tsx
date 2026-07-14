import React from "react";

interface KpiProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

export default function Kpi({
  icon: Icon,
  label,
  value,
}: KpiProps) {
  return (
    <div className="kpi">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}