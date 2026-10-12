import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Unlock } from "lucide-react";
import { sound } from "@/lib/soundManager";

export default function LevelUpCelebration({ level, trigger }) {
  const [show, setShow] = useState(false);
  const [shownLevel, setShownLevel] = useState(level);

  useEffect(() => {
    if (trigger == null) return;
    setShownLevel(level);
    setShow(true);
    sound.levelUp();
    const t = setTimeout(() => setShow(false), 2800);
    return () => clearTimeout(t);
     
  }, [trigger]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="levelup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center pointer-events-none"
        >
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]" />
          <motion.div
            initial={{ scale: 0.4, y: 40, rotate: -6 }}
            animate={{ scale: 1, y: 0, rotate: 0, transition: { type: "spring", stiffness: 260, damping: 18 } }}
            exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.25 } }}
            className="relative flex flex-col items-center gap-3 rounded-[28px] border-4 border-amber-300 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-amber-500 px-10 py-8 text-center shadow-[0_25px_60px_rgba(15,23,42,.45)]"
          >
            <motion.div
              initial={{ rotate: -12, scale: 0 }}
              animate={{ rotate: 0, scale: 1, transition: { delay: 0.15, type: "spring", stiffness: 300 } }}
              className="grid h-16 w-16 place-items-center rounded-2xl bg-white/25 ring-2 ring-white/40"
            >
              <Sparkles className="h-8 w-8 text-white drop-shadow" />
            </motion.div>
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
            >
              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-100">Level Up</p>
              <p className="mt-1 font-display text-5xl font-black text-white drop-shadow-lg">Level {shownLevel}</p>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-white/85">
                <Unlock className="h-3.5 w-3.5" /> New rides &amp; expansions unlocked
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}