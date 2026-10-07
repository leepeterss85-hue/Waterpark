import React, { useMemo } from "react";

// Makes launched park events visually obvious on the map.
// Each event category produces distinct visible activity: crowds, decorations,
// particles, and lighting — so events feel alive rather than just a stat boost.

const CATEGORY_FX = {
  summer: { effect: "confetti", accent: "#fbbf24", emoji: ["🏖️", "🎈", "🦩"] },
  halloween: { effect: "fog", accent: "#a855f7", emoji: ["🎃", "👻", "🦇"] },
  winter: { effect: "snow", accent: "#67e8f9", emoji: ["❄️", "⛄", "✨"] },
  night: { effect: "glow", accent: "#818cf8", emoji: ["🌙", "✨", "💫"] },
  fireworks: { effect: "fireworks", accent: "#f43f5e", emoji: ["🎆", "🎇", "✨"] },
  concert: { effect: "music", accent: "#ec4899", emoji: ["🎵", "🎶", "🎤"] },
  competition: { effect: "flags", accent: "#f59e0b", emoji: ["🏆", "🚩", "⭐"] },
  promotion: { effect: "streamers", accent: "#10b981", emoji: ["🎉", "🎊", "📣"] },
};

export default function EventOverlay({ activeEvents = [], grid }) {
  const fx = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const ev of activeEvents) {
      const cat = ev.category || "summer";
      if (seen.has(cat)) continue;
      seen.add(cat);
      const def = CATEGORY_FX[cat];
      if (def) list.push({ ...def, id: ev.id, name: ev.name });
    }
    return list;
  }, [activeEvents]);

  if (fx.length === 0) return null;

  return (
    <div className="event-overlay" aria-hidden="true">
      {fx.map((f) => (
        <EventFx key={f.id} fx={f} grid={grid} />
      ))}
    </div>
  );
}

function EventFx({ fx, grid }) {
  const rows = Math.max(1, Math.ceil((grid?.length || 0) / 8));

  if (fx.effect === "fireworks") {
    return (
      <div className="event-fx-fireworks">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="firework-burst" style={{
            left: `${15 + i * 22}%`,
            top: `${8 + (i % 2) * 12}%`,
            "--burst-color": fx.accent,
            animationDelay: `${i * 0.5}s`,
          }}>
            {Array.from({ length: 8 }, (_, j) => (
              <i key={j} style={{ transform: `rotate(${j * 45}deg)` }} />
            ))}
          </span>
        ))}
      </div>
    );
  }

  if (fx.effect === "snow") {
    return (
      <div className="event-fx-snow">
        {Array.from({ length: 24 }, (_, i) => (
          <span key={i} className="snowflake" style={{
            left: `${(i * 4.2) % 100}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            animationDuration: `${4 + (i % 3)}s`,
          }}>❄</span>
        ))}
      </div>
    );
  }

  if (fx.effect === "fog") {
    return (
      <div className="event-fx-fog">
        {[0, 1, 2].map((i) => (
          <span key={i} className="fog-layer" style={{
            top: `${20 + i * 25}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${8 + i * 2}s`,
          }} />
        ))}
        {fx.emoji.slice(0, 3).map((e, i) => (
          <span key={i} className="fog-emoji" style={{
            left: `${20 + i * 28}%`,
            top: `${15 + i * 20}%`,
            animationDelay: `${i * 0.8}s`,
          }}>{e}</span>
        ))}
      </div>
    );
  }

  if (fx.effect === "confetti") {
    return (
      <div className="event-fx-confetti">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className="confetti-piece" style={{
            left: `${(i * 5.5) % 100}%`,
            backgroundColor: [fx.accent, "#f43f5e", "#10b981", "#818cf8"][i % 4],
            animationDelay: `${(i * 0.2) % 2}s`,
            animationDuration: `${2.5 + (i % 2) * 0.5}s`,
          }} />
        ))}
        {fx.emoji.slice(0, 3).map((e, i) => (
          <span key={i} className="event-emoji-float" style={{
            left: `${15 + i * 30}%`,
            top: `${10 + i * 15}%`,
            animationDelay: `${i * 0.6}s`,
          }}>{e}</span>
        ))}
      </div>
    );
  }

  if (fx.effect === "music") {
    return (
      <div className="event-fx-music">
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="music-note" style={{
            left: `${10 + i * 11}%`,
            bottom: `${20 + (i % 3) * 15}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + (i % 2)}s`,
          }}>{fx.emoji[i % fx.emoji.length]}</span>
        ))}
        <span className="concert-stage-glow" />
      </div>
    );
  }

  if (fx.effect === "glow") {
    return (
      <div className="event-fx-glow">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="glow-orb" style={{
            left: `${12 + i * 15}%`,
            top: `${15 + (i % 2) * 25}%`,
            animationDelay: `${i * 0.3}s`,
          }} />
        ))}
      </div>
    );
  }

  if (fx.effect === "flags") {
    return (
      <div className="event-fx-flags">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="event-flag" style={{
            left: `${10 + i * 20}%`,
            top: `${8 + (i % 2) * 6}%`,
            animationDelay: `${i * 0.2}s`,
          }}>🚩</span>
        ))}
        <span className="trophy-glow" />
      </div>
    );
  }

  if (fx.effect === "streamers") {
    return (
      <div className="event-fx-streamers">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="streamer" style={{
            left: `${8 + i * 16}%`,
            animationDelay: `${i * 0.3}s`,
          }} />
        ))}
        {fx.emoji.slice(0, 2).map((e, i) => (
          <span key={i} className="event-emoji-float" style={{
            left: `${25 + i * 40}%`,
            top: `${12 + i * 10}%`,
            animationDelay: `${i * 0.5}s`,
          }}>{e}</span>
        ))}
      </div>
    );
  }

  return null;
}