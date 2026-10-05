import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Cloud, CloudRain, CloudLightning, CloudSun } from "lucide-react";

const WEATHER_ICON = { clear: Sun, sunny: Sun, cloudy: Cloud, rain: CloudRain, storm: CloudLightning };

export default function DayTransition({ day, weather, seasonEvent, trigger }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (trigger == null) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1700);
    return () => clearTimeout(t);
  }, [trigger]);
  const WIcon = WEATHER_ICON[weather?.id] || Sun;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="pointer-events-none fixed inset-x-0 top-24 z-50 flex justify-center"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900/92 px-5 py-3 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur">
            <span className="font-display text-2xl font-black">Day {day}</span>
            <span className="h-6 w-px bg-white/20" />
            <WIcon className="h-5 w-5 text-cyan-300" />
            <span className="text-sm font-bold">{weather?.name || "Clear"}</span>
            {seasonEvent && <span className="rounded-full bg-violet-500/30 px-2 py-0.5 text-[10px] font-black text-violet-200">{seasonEvent.name}</span>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}