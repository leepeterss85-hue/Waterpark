import React from "react";

export default function EventLog({ log }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Park Log
      </h3>
      <div className="flex flex-col gap-1.5">
        {log.map((entry, i) => (
          <div
            key={i}
            className={`text-sm ${i === 0 ? "font-medium text-slate-700" : "text-slate-400"}`}
          >
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}