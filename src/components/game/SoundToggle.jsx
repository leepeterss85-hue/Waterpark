import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sound } from "@/lib/soundManager";

export default function SoundToggle() {
  const [muted, setMuted] = useState(sound.isMuted());
  return (
    <button
      onClick={() => { const m = sound.toggle(); setMuted(m); if (!m) sound.click(); }}
      className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-sky-50"
      title={muted ? "Unmute sound" : "Mute sound"}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
    >
      {muted ? <VolumeX className="h-4 w-4 text-slate-400" /> : <Volume2 className="h-4 w-4 text-cyan-600" />}
    </button>
  );
}