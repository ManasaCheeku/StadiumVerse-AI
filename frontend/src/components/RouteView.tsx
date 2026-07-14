import React from "react";
import type { RouteResponse } from "../api";

interface RouteViewProps {
  route: RouteResponse;
}

export default function RouteView({ route }: RouteViewProps) {
  return (
    <div>
      <p>{route.route.join(" → ")}</p>
      <small>
        {route.estimated_minutes} minutes · {route.accessibility_notes[0]}
      </small>
    </div>
  );
}