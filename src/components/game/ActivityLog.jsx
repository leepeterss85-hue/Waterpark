import React from "react";
import { Smile, Meh, Frown, MessageSquare, AlertTriangle, Wrench, Sparkles, Zap, CalendarDays } from "lucide-react";

const SENTIMENT = {
  happy: { icon: Smile, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200", label: "Happy" },
  content: { icon: Meh, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200", label: "Okay" },
  unhappy: { icon: Frown, color: "text-rose-600", bg: "bg-rose-50", ring: "ring-rose-200", label: "Unhappy" },
};

const EVENT_ICON = {
  "⚠️": { icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50" },
  "🔧": { icon: Wrench, color: "text-amber-600", bg: "bg-amber-50" },
  "✅": { icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
  "⚡": { icon: Zap, color: "text-violet-600", bg: "bg-violet-50" },
  "👑": { icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50" },
};

function eventVisual(text) {
  const marker = text.slice(text.indexOf(": ") + 2, text.indexOf(": ") + 4);
  return EVENT_ICON[marker] || { icon: CalendarDays, color: "text-slate-600", bg: "bg-slate-50" };
}

export default function ActivityLog({ feedback = [], log = [], issueCount = 0, guestExperience }) {
  const exp = guestExperience || { happy: 0, content: 0, unhappy: 0 };
  const total = Math.max(1, exp.happy + exp.content + exp.unhappy);
  const happyPct = Math.round((exp.happy / total) * 100);
  const contentPct = Math.round((exp.content / total) * 100);
  const unhappyPct = 100 - happyPct - contentPct;

  // Merge feedback and park events into one chronological feed (newest first).
  const taggedFeedback = feedback.map((f) => ({ kind: "feedback", ...f, sort: f.day }));
  const taggedEvents = log.map((e, i) => ({ kind: "event", ...e, sort: e.day + i / 100 }));
  const feed = [...taggedFeedback, ...taggedEvents].sort((a, b) => b.sort - a.sort).slice(0, 30);

  return (
    <div className="rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <MessageSquare className="h-3.5 w-3.5 text-cyan-600" /> Activity Log
        </h3>
        {issueCount > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
            {issueCount} active {issueCount === 1 ? "issue" : "issues"}
          </span>
        )}
      </div>

      {/* Sentiment bar */}
      <div className="mb-3">
        <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="bg-emerald-400" style={{ width: happyPct + "%" }} />
          <div className="bg-amber-300" style={{ width: contentPct + "%" }} />
          <div className="bg-rose-400" style={{ width: unhappyPct + "%" }} />
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[10px] font-semibold">
          <span className="flex items-center gap-1 text-emerald-600"><Smile className="h-3 w-3" />{Math.round(exp.happy)} happy</span>
          <span className="flex items-center gap-1 text-amber-600"><Meh className="h-3 w-3" />{Math.round(exp.content)} okay</span>
          <span className="flex items-center gap-1 text-rose-600"><Frown className="h-3 w-3" />{Math.round(exp.unhappy)} unhappy</span>
        </div>
      </div>

      <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1">
        {feed.length === 0 && <p className="py-4 text-center text-xs text-slate-400">No activity yet — open your park to hear from guests.</p>}
        {feed.map((item, i) => {
          if (item.kind === "feedback") {
            const s = SENTIMENT[item.sentiment];
            const Icon = s.icon;
            return (
              <div key={"f" + i} className={"flex items-start gap-2 rounded-lg px-2 py-1.5 ring-1 " + s.bg + " " + s.ring}>
                <Icon className={"mt-0.5 h-3.5 w-3.5 shrink-0 " + s.color} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-4 text-slate-700">&ldquo;{item.quote}&rdquo;</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    <span className={s.color}>{s.label}</span>
                    <span className="rounded bg-white/70 px-1 py-0.5">{item.reasonLabel}</span>
                    <span>Day {item.day}</span>
                  </div>
                </div>
              </div>
            );
          }
          const ev = eventVisual(item.text);
          const Icon = ev.icon;
          return (
            <div key={"e" + i} className="flex items-start gap-2 rounded-lg bg-slate-50 px-2 py-1.5 ring-1 ring-slate-100">
              <Icon className={"mt-0.5 h-3.5 w-3.5 shrink-0 " + ev.color} />
              <p className="text-xs leading-4 text-slate-600">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}