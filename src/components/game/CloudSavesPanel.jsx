import React, { useState, useEffect, useCallback } from "react";
import { Cloud, Save, FolderOpen, Trash2, Calendar, PoundSterling, Star, Users, RefreshCw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function CloudSavesPanel({ onLoadCloud, onSaveCloud }) {
  const [saves, setSaves] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("cloudSaves", { action: "list" });
      setSaves(res.data?.saves || []);
    } catch (e) {
      setError("Could not load cloud saves. Make sure you're signed in.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = saves.some((s) => s.save_name === trimmed);
    if (exists && !window.confirm(`Overwrite cloud save "${trimmed}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      const ok = onSaveCloud ? await onSaveCloud(trimmed) : false;
      if (ok) {
        setName("");
        await refresh();
      } else {
        setError("Save failed. Try again.");
      }
    } catch (e) {
      setError("Could not save to cloud. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (saveName) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("cloudSaves", { action: "load", name: saveName });
      if (res.data?.ok && res.data?.save?.game_data && onLoadCloud) {
        onLoadCloud(res.data.save.game_data);
      } else {
        setError(res.data?.error || "Load failed");
      }
    } catch (e) {
      setError("Could not load cloud save.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (saveName) => {
    if (!window.confirm(`Delete cloud save "${saveName}"?`)) return;
    try {
      const res = await base44.functions.invoke("cloudSaves", { action: "delete", name: saveName });
      if (res.data?.ok) await refresh();
      else setError(res.data?.error || "Delete failed");
    } catch (e) {
      setError("Could not delete cloud save.");
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <Cloud className="h-3.5 w-3.5" /> Cloud Saves
        </h3>
        <button
          onClick={refresh}
          disabled={loading}
          className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

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
          disabled={!name.trim() || saving}
          className="flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
        </button>
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-100">{error}</p>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {loading && saves.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 p-4 text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading cloud saves…
          </div>
        ) : saves.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400">
            No cloud saves yet. Save your park to access it from any device.
          </p>
        ) : (
          saves.map((s) => (
            <div key={s.id} className="rounded-xl bg-sky-50 p-3 ring-1 ring-sky-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{s.save_name}</span>
                <span className="text-[10px] text-slate-400">
                  {s.updated_date ? new Date(s.updated_date).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Day {s.day ?? 1}</span>
                <span className="flex items-center gap-1"><PoundSterling className="h-3 w-3" /> ${(s.money ?? 0).toLocaleString()}</span>
                <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {s.reputation ?? 50}%</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {(s.guests ?? 0).toLocaleString()}</span>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <button
                  onClick={() => handleLoad(s.save_name)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-sky-600 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-700"
                >
                  <FolderOpen className="h-3.5 w-3.5" /> Load
                </button>
                <button
                  onClick={() => handleDelete(s.save_name)}
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