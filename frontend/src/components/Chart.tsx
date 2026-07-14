import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import type { OperationsSnapshot } from "../api";

interface ChartProps {
  data: OperationsSnapshot["crowd"]["gate_occupancy"];
}

export default function Chart({ data }: ChartProps) {
  return (
    <ResponsiveContainer height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="gate" />
        <YAxis />
        <Tooltip />
        <Line dataKey="occupancy" stroke="#1f5b4e" strokeWidth={3} />
        <Line dataKey="queue" stroke="#d06f3c" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
}