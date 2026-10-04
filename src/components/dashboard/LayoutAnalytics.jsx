import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { LayoutGrid } from "lucide-react";
import { getAttraction } from "@/data/gameData";

const SLOTS_KEY = "waterpark-tycoon-slots";

function readSlots() {
  try {
    return JSON.parse(localStorage.getItem(SLOTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function avg(arr, field) {
  if (!arr || arr.length === 0) return 0;
  return Math.round(arr.reduce((s, r) => s + (r[field] || 0), 0) / arr.length);
}

function layoutStats(name, data) {
  const grid = data.grid || [];
  const placed = grid.map((id) => (id ? getAttraction(id) : null)).filter(Boolean);
  const attractions = placed.filter((a) => a.category === "attraction");
  const facilities = placed.filter((a) => a.category === "facility");
  const distinctTypes = new Set(attractions.map((a) => a.id)).size;
  return {
    name,
    attractionCount: attractions.length,
    facilityCount: facilities.length,
    distinctTypes,
    peakGuests: data.peakGuests ?? data.guests ?? 0,
    avgGuests: avg(data.history, "guests"),
    avgIncome: avg(data.history, "income"),
    reputation: data.reputation ?? 0,
    lifetimeEarnings: data.lifetimeEarnings ?? 0,
    day: data.day ?? 0,
  };
}

export default function LayoutAnalytics({
  grid,
  history,
  peakGuests,
  lifetimeEarnings,
  reputation,
  guests,
  day,
}) {
  const layouts = useMemo(() => {
    const slots = readSlots();
    const list = [
      layoutStats("Current Park", {
        grid,
        history,
        peakGuests,
        lifetimeEarnings,
        reputation,
        guests,
        day,
      }),
    ];
    Object.entries(slots).forEach(([name, s]) => list.push(layoutStats(name, s)));
    return list;
  }, [grid, history, peakGuests, lifetimeEarnings, reputation, guests, day]);

  const chartData = layouts.map((l) => ({
    name: l.name,
    "Peak Guests": l.peakGuests,
    "Avg Daily Guests": l.avgGuests,
  }));

  const onlyCurrent = layouts.length <= 1;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-slate-800">
        <LayoutGrid className="h-5 w-5 text-cyan-500" /> Layout Analysis
      </h2>
      <p className="mb-4 text-sm text-slate-400">
        Compare saved park layouts against visitor behavior — guests, spending,
        and satisfaction.
      </p>

      {onlyCurrent && (
        <div className="mb-4 rounded-xl bg-sky-50 p-4 text-sm text-slate-500 ring-1 ring-sky-100">
          Save multiple parks from the main screen to compare how different
          layouts affect visitor behavior.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="py-2 pr-3 font-semibold">Layout</th>
              <th className="py-2 px-3 font-semibold">Composition</th>
              <th className="py-2 px-3 text-right font-semibold">Peak</th>
              <th className="py-2 px-3 text-right font-semibold">Avg Guests</th>
              <th className="py-2 px-3 text-right font-semibold">Avg Income</th>
              <th className="py-2 px-3 text-right font-semibold">Rep</th>
              <th className="py-2 px-3 text-right font-semibold">Lifetime $</th>
            </tr>
          </thead>
          <tbody>
            {layouts.map((l) => (
              <tr key={l.name} className="border-t border-slate-100">
                <td className="py-2.5 pr-3 font-semibold text-slate-700">
                  {l.name}
                  <span className="block text-[11px] font-normal text-slate-400">
                    Day {l.day}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-500">
                  {l.attractionCount} attr · {l.facilityCount} fac ·{" "}
                  {l.distinctTypes} types
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                  {l.peakGuests.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600">
                  {l.avgGuests.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600">
                  ${l.avgIncome.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600">
                  {l.reputation}%
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600">
                  ${l.lifetimeEarnings.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Peak Guests" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Avg Daily Guests" fill="#22d3ee" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}