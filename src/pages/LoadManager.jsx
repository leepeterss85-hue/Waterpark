import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Waves, ArrowLeft, Trash2, Play, Calendar, DollarSign, Users, Star, Save } from "lucide-react";
import { useGameState } from "@/hooks/useGameState";

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 ring-1 ring-slate-100">
      <Icon className={`h-4 w-4 ${tone}`} />
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
        <div className="text-sm font-bold text-slate-700">{value}</div>
      </div>
    </div>
  );
}

export default function LoadManager() {
  const game = useGameState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleLoad = async (name) => {
    setLoading(name);
    game.loadPark(name);
    // allow the persisted state to flush to storage before remounting Home
    await new Promise((r) => setTimeout(r, 450));
    navigate("/");
  };

  const handleDelete = (name) => {
    game.deleteSave(name);
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-cyan-50 to-blue-100">
      <header className="border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-md">
            <Save className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-800">
              Load Manager
            </h1>
            <p className="text-sm text-slate-400">Switch between your saved parks</p>
          </div>
          <Link
            to="/"
            className="ml-auto flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to park
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {game.saves.length === 0 ? (
          <div className="rounded-2xl bg-white/80 p-10 text-center shadow-sm ring-1 ring-slate-100">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-sky-100">
              <Waves className="h-7 w-7 text-sky-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-700">No saved parks yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">
              Build a park from the main screen and use the Save / Load panel to save it.
              Saved layouts will appear here for quick switching.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              <Play className="h-4 w-4" />
              Go to park
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {game.saves.map((s) => (
              <div
                key={s.name}
                className="flex flex-col gap-4 rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-bold text-slate-800">
                      {s.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {s.savedAt ? new Date(s.savedAt).toLocaleString() : "—"}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-600">
                    Day {s.day ?? 1}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Stat icon={DollarSign} label="Cash" value={`$${(s.money ?? 0).toLocaleString()}`} tone="text-emerald-500" />
                  <Stat icon={Star} label="Reputation" value={`${s.reputation ?? 0}%`} tone="text-amber-500" />
                  <Stat icon={Users} label="Guests" value={s.guests ?? 0} tone="text-sky-500" />
                  <Stat icon={Calendar} label="Day" value={s.day ?? 1} tone="text-violet-500" />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleLoad(s.name)}
                    disabled={loading !== null}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    {loading === s.name ? "Loading…" : "Load park"}
                  </button>
                  {confirmDelete === s.name ? (
                    <button
                      onClick={() => handleDelete(s.name)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(s.name)}
                      className="flex items-center justify-center rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {confirmDelete === s.name && (
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="self-start text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}