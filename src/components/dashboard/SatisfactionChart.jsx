import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function SatisfactionChart({ history }) {
  const data = history.map((h) => ({ day: `D${h.day}`, reputation: h.reputation }));
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-1 font-display text-lg font-bold text-slate-800">Satisfaction Rating</h3>
      <p className="mb-4 text-sm text-slate-400">Park reputation over time (0–100%)</p>
      {data.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-slate-300">
          Play a few days to see satisfaction trends
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ left: -10, right: 10, top: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
            <Line type="monotone" dataKey="reputation" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: "#f59e0b" }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}