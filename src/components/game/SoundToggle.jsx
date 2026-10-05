import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sound } from "@/lib/soundManager";

export default function SoundToggle() {
  const [muted, setMuted] = useState(sound.isMuted());
  return (
    <button
      onClick={() => { const m = sound.toggle(); setMuted(m); if (!m) sound.click(); }}
      className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15 transition hover:bg-white/15"
      title={muted ? "Unmute sound" : "Mute sound"}
      aria-label={muted ? "Unmute sound" : "Mute sound"}
    >
      {muted ? <VolumeX className="h-4 w-4 text-white/45" /> : <Volume2 className="h-4 w-4 text-cyan-300" />}
    </button>
  );
}