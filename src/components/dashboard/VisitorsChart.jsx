import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function VisitorsChart({ history }) {
  const data = history.map((h) => ({ day: `D${h.day}`, guests: h.guests }));
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-1 font-display text-lg font-bold text-slate-800">Daily Visitors</h3>
      <p className="mb-4 text-sm text-slate-400">Guests visiting the park each day</p>
      {data.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-slate-300">
          Play a few days to see visitor trends
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ left: -10, right: 10, top: 5 }}>
            <defs>
              <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
            <Area type="monotone" dataKey="guests" stroke="#06b6d4" strokeWidth={2} fill="url(#visGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}