import React, { useState, useEffect, useCallback } from "react";
import { Medal, RefreshCw, Loader2, TrendingUp, Star, Users, Crown, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LeaderboardPanel({ level, day, reputation, guests, money, empirePoints, resortRating, peakGuests, onSubmit }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [parkName, setParkName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("leaderboard", { action: "fetch" });
      setEntries(res.data?.entries || []);
    } catch (e) {
      setError("Could not load leaderboard. Make sure you're signed in.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSubmit = async () => {
    const pn = playerName.trim() || "Tycoon";
    const park = parkName.trim() || `Day ${day} Park`;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const ok = onSubmit ? await onSubmit(pn, park) : false;
      if (ok) {
        setSubmitMsg({ type: "success", text: "Submitted to leaderboard!" });
        setParkName("");
        await refresh();
      } else {
        setSubmitMsg({ type: "error", text: "Submit failed. Try again." });
      }
    } catch (e) {
      setSubmitMsg({ type: "error", text: "Could not submit. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const yourScore = Math.round(
    (reputation || 0) * 100 + (peakGuests || 0) * 10 + (empirePoints || 0) * 50 + (level || 1) * 200 + (resortRating || 0) * 30
  );

  const rank = (n) => {
    if (n >= 40) return "text-amber-500";
    if (n >= 30) return "text-purple-500";
    if (n >= 20) return "text-sky-500";
    if (n >= 10) return "text-emerald-500";
    return "text-slate-500";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Your stats */}
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-3 ring-1 ring-amber-100">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
          <Medal className="h-3.5 w-3.5" /> Your Park
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/70 p-2">
            <div className="text-[9px] font-bold uppercase text-slate-400">Level</div>
            <div className="text-lg font-black text-amber-600">{level}</div>
          </div>
          <div className="rounded-lg bg-white/70 p-2">
            <div className="text-[9px] font-bold uppercase text-slate-400">Score</div>
            <div className="text-lg font-black text-emerald-600">{yourScore.toLocaleString()}</div>
          </div>
          <div className="rounded-lg bg-white/70 p-2">
            <div className="text-[9px] font-bold uppercase text-slate-400">Day</div>
            <div className="text-lg font-black text-sky-600">{day}</div>
          </div>
        </div>
      </div>

      {/* Submit form */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Submit Your Park</div>
        <div className="flex flex-col gap-2">
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name (e.g. SplashKing)"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          />
          <input
            value={parkName}
            onChange={(e) => setParkName(e.target.value)}
            placeholder="Park name (e.g. Paradise Falls)"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-amber-400 to-orange-500 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-amber-300 hover:to-orange-400 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit to Leaderboard
          </button>
          {submitMsg && (
            <p className={`rounded-lg px-3 py-2 text-[11px] font-semibold ${submitMsg.type === "success" ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-rose-50 text-rose-600 ring-1 ring-rose-100"}`}>
              {submitMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <TrendingUp className="h-3.5 w-3.5" /> Global Rankings
          </h3>
          <button
            onClick={refresh}
            disabled={loading}
            className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-100">{error}</p>
        )}

        <div className="flex flex-col gap-1.5">
          {loading && entries.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 p-4 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading leaderboard…
            </div>
          ) : entries.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400">
              No entries yet. Be the first to claim a spot!
            </p>
          ) : (
            entries.map((e, i) => (
              <div
                key={e.id || i}
                className={`flex items-center gap-2 rounded-xl p-2.5 ring-1 ${
                  i === 0 ? "bg-amber-50 ring-amber-200" : i === 1 ? "bg-slate-50 ring-slate-200" : i === 2 ? "bg-orange-50/60 ring-orange-100" : "bg-white ring-slate-100"
                }`}
              >
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-black ${rank(i)}`}>
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold text-slate-700">{e.player_name}</span>
                    {i === 0 && <Crown className="h-3 w-3 shrink-0 text-amber-500" />}
                  </div>
                  <div className="truncate text-[10px] font-medium text-slate-400">{e.park_name}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-sm font-black text-emerald-600">{(e.score || 0).toLocaleString()}</span>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                    <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />{e.level || 1}</span>
                    <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{(e.peak_guests || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}