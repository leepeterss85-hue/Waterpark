import React from "react";

export default function EventLog({ log, issueCount = 0 }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <h3 className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Park Log
        {issueCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
            {issueCount} active {issueCount === 1 ? "issue" : "issues"}
          </span>
        )}
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