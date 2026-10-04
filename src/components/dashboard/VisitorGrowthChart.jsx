import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";

export default function VisitorGrowthChart({ history }) {
  const last30 = history.slice(-30).map((h) => ({
    day: `D${h.day}`,
    guests: h.guests,
    rawDay: h.day,
  }));

  const peak =
    last30.length > 0
      ? last30.reduce((max, d) => (d.guests > max.guests ? d : max), last30[0])
      : null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-slate-800">
          Visitor Growth (30 Days)
        </h3>
        {peak && (
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-600">
            Peak: {peak.guests} on D{peak.rawDay}
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-400">
        Daily attendance over the last 30 days to spot peak trends
      </p>
      {last30.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-slate-300">
          Play a few days to see visitor growth trends
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={last30} margin={{ left: -10, right: 12, top: 10 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
              formatter={(v) => [`${v} guests`, "Visitors"]}
            />
            <Line
              type="monotone"
              dataKey="guests"
              stroke="url(#growthGrad)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: "#06b6d4" }}
            />
            {peak && (
              <ReferenceDot
                x={peak.day}
                y={peak.guests}
                r={5}
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}