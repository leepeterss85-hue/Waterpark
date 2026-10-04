import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getAttraction } from "@/data/gameData";

export default function AttractionBreakdown({ grid }) {
  const counts = {};
  grid.filter(Boolean).forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });
  const data = Object.entries(counts).map(([id, count]) => {
    const a = getAttraction(id);
    return {
      name: a.name.split(" ")[0],
      income: a.income * count,
      upkeep: a.maintenance * count,
    };
  });
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-1 font-display text-lg font-bold text-slate-800">Attraction Performance</h3>
      <p className="mb-4 text-sm text-slate-400">Daily income vs upkeep by attraction type</p>
      {data.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center text-sm text-slate-300">
          Build attractions to see performance
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ left: -10, right: 10, top: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="upkeep" name="Upkeep" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}