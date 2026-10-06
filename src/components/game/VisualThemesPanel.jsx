import React from "react";
import { Palette, Lock, Check } from "lucide-react";
import { VISUAL_THEMES } from "@/data/visualThemes";

export default function VisualThemesPanel({ level, activeTheme, onSelect }) {
  return (
    <div className="waterpark-panel rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Palette className="h-4 w-4 text-violet-500" />
        <h3 className="text-sm font-black text-slate-900">Park Themes</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {VISUAL_THEMES.map((t) => {
          const unlocked = level >= t.unlockLevel;
          const active = activeTheme === t.id;
          return (
            <button
              key={t.id}
              disabled={!unlocked}
              onClick={() => unlocked && onSelect(t.id)}
              className={`relative overflow-hidden rounded-xl border p-2.5 text-left transition ${
                active ? "border-violet-400 ring-2 ring-violet-300" : unlocked ? "border-slate-200 hover:border-slate-300" : "border-slate-200 opacity-50"
              }`}
            >
              <div className={`mb-1.5 h-8 w-full rounded-lg bg-gradient-to-br ${t.preview}`} />
              <p className="text-xs font-black text-slate-800">{t.name}</p>
              <p className="text-[10px] text-slate-400">{t.desc}</p>
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <Lock className="h-3 w-3" /> Lv {t.unlockLevel}
                  </span>
                </div>
              )}
              {active && (
                <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-violet-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}