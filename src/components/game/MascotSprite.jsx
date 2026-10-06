import React, { useEffect, useState } from "react";

export default function MascotSprite({ mascot, grid }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [target, setTarget] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTarget({
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 80,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let raf;
    const animate = () => {
      setPos((p) => ({
        x: p.x + (target.x - p.x) * 0.02,
        y: p.y + (target.y - p.y) * 0.02,
      }));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  if (!mascot) return null;

  return (
    <div
      className="pointer-events-none absolute z-30 transition-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
    >
      <div className="relative">
        <div
          className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${mascot.color} text-2xl shadow-lg ring-2 ring-white/80`}
          style={{ animation: "mascot-bounce 0.6s ease-in-out infinite alternate" }}
        >
          {mascot.emoji}
        </div>
        <div className="absolute -bottom-1 left-1/2 h-2 w-6 -translate-x-1/2 rounded-full bg-slate-900/20 blur-[2px]" />
      </div>
    </div>
  );
}