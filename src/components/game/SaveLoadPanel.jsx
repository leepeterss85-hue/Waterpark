import React, { useState } from "react";
import {
  Save,
  FolderOpen,
  Trash2,
  Calendar,
  DollarSign,
  Star,
  Users,
} from "lucide-react";

export default function SaveLoadPanel({ saves, onSave, onLoad, onDelete }) {
  const [name, setName] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = saves.some((s) => s.name === trimmed);
    if (exists && !window.confirm(`Overwrite existing save "${trimmed}"?`)) return;
    if (onSave(trimmed)) setName("");
  };

  return (
    <div>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Save / Load
      </h3>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="Park name…"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        />
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {saves.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400">
            No saved parks yet. Name your park and save it to return later.
          </p>
        ) : (
          saves.map((s) => (
            <div key={s.name} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{s.name}</span>
                <span className="text-[10px] text-slate-400">
                  {s.savedAt ? new Date(s.savedAt).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Day {s.day ?? 1}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> ${(s.money ?? 0).toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" /> {s.reputation ?? 50}%
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {(s.guests ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <button
                  onClick={() => onLoad(s.name)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-900 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <FolderOpen className="h-3.5 w-3.5" /> Load
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete save "${s.name}"?`)) onDelete(s.name);
                  }}
                  className="grid h-7 w-8 place-items-center rounded-lg bg-white text-rose-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}