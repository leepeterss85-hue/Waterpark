import React, { useState, useEffect, useCallback } from "react";
import { Link2, Send, Loader2, Copy, Check, Eye, Calendar, Star, Users, Trophy, RefreshCw, FolderOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ShareParkPanel({ day, reputation, guests, level, onShare, onViewShared }) {
  const [parkName, setParkName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareCode, setShareCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(null);

  const [viewCode, setViewCode] = useState("");
  const [viewing, setViewing] = useState(false);
  const [viewedPark, setViewedPark] = useState(null);
  const [viewError, setViewError] = useState(null);

  const [recentParks, setRecentParks] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const refreshRecent = useCallback(async () => {
    setLoadingRecent(true);
    try {
      const res = await base44.functions.invoke("sharePark", { action: "list" });
      setRecentParks(res.data?.parks || []);
    } catch (e) {
      /* ignore */
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => { refreshRecent(); }, [refreshRecent]);

  const handleShare = async () => {
    const park = parkName.trim() || "My Water Park";
    const player = playerName.trim() || "Player";
    setSharing(true);
    setShareError(null);
    setShareCode(null);
    try {
      const code = onShare ? await onShare(park, player) : null;
      if (code) {
        setShareCode(code);
        setParkName("");
        await refreshRecent();
      } else {
        setShareError("Could not share park. Try again.");
      }
    } catch (e) {
      setShareError("Could not share park. Try again.");
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = () => {
    if (!shareCode) return;
    try {
      navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleView = async () => {
    const code = viewCode.trim().toUpperCase();
    if (!code) return;
    setViewing(true);
    setViewError(null);
    setViewedPark(null);
    try {
      const park = onViewShared ? await onViewShared(code) : null;
      if (park) {
        setViewedPark(park);
      } else {
        setViewError("Park not found. Check the code and try again.");
      }
    } catch (e) {
      setViewError("Could not load shared park.");
    } finally {
      setViewing(false);
    }
  };

  const handleLoadShared = () => {
    if (!viewedPark?.game_data) return;
    if (!window.confirm(`Load "${viewedPark.park_name}" into your game? This replaces your current park.`)) return;
    // Use the same load mechanism as cloud saves
    const event = new CustomEvent("load-shared-park", { detail: viewedPark.game_data });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Share your park */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Send className="h-3.5 w-3.5" /> Share Your Park
        </div>
        <div className="flex flex-col gap-2">
          <input
            value={parkName}
            onChange={(e) => setParkName(e.target.value)}
            placeholder="Park name (e.g. Paradise Falls)"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          />
          <input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
          />
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-b from-cyan-400 to-sky-500 px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-cyan-300 hover:to-sky-400 disabled:opacity-40"
          >
            {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Generate Share Code
          </button>
          {shareError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-100">{shareError}</p>
          )}
          {shareCode && (
            <div className="rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-100">
              <div className="mb-1 text-[10px] font-bold uppercase text-emerald-600">Share Code</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-white px-3 py-2 text-center text-lg font-black tracking-[0.2em] text-emerald-700 ring-1 ring-emerald-200">
                  {shareCode}
                </code>
                <button
                  onClick={handleCopy}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-emerald-600">Share this code with friends so they can view your park!</p>
            </div>
          )}
        </div>
      </div>

      {/* View a shared park */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          <Eye className="h-3.5 w-3.5" /> View a Shared Park
        </div>
        <div className="flex gap-2">
          <input
            value={viewCode}
            onChange={(e) => setViewCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleView()}
            placeholder="Enter code (e.g. AB12CD)"
            maxLength={8}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold tracking-wider text-slate-700 outline-none focus:border-slate-400"
          />
          <button
            onClick={handleView}
            disabled={viewing || !viewCode.trim()}
            className="flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-40"
          >
            {viewing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />} View
          </button>
        </div>
        {viewError && (
          <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-100">{viewError}</p>
        )}
        {viewedPark && (
          <div className="mt-3 rounded-lg bg-sky-50 p-3 ring-1 ring-sky-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">{viewedPark.park_name}</span>
              <span className="text-[10px] text-slate-400">by {viewedPark.player_name}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> Level {viewedPark.level || 1}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Day {viewedPark.day || 1}</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {viewedPark.reputation || 0}%</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {(viewedPark.guests || 0).toLocaleString()}</span>
            </div>
            <button
              onClick={handleLoadShared}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-sky-600 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700"
            >
              <FolderOpen className="h-3.5 w-3.5" /> Load Into My Game
            </button>
          </div>
        )}
      </div>

      {/* Recent shared parks */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            <Link2 className="h-3.5 w-3.5" /> Recently Shared
          </h3>
          <button
            onClick={refreshRecent}
            disabled={loadingRecent}
            className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingRecent ? "animate-spin" : ""}`} />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          {loadingRecent && recentParks.length === 0 ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : recentParks.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400">
              No parks shared yet. Be the first!
            </p>
          ) : (
            recentParks.map((p, i) => (
              <button
                key={p.id || i}
                onClick={() => { setViewCode(p.share_code); handleView(); }}
                className="flex items-center gap-2 rounded-xl bg-white p-2.5 text-left ring-1 ring-slate-100 transition hover:bg-slate-50"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-50 text-cyan-600">
                  <Link2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold text-slate-700">{p.park_name}</div>
                  <div className="truncate text-[10px] text-slate-400">by {p.player_name}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-0.5"><Trophy className="h-2.5 w-2.5" />{p.level || 1}</span>
                  <span className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5" />{p.reputation || 0}%</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}