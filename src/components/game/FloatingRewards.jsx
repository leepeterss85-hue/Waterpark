import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingRewards({ amount, trigger }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (trigger == null || !amount) return;
    const id = trigger;
    const offset = (Math.random() - 0.5) * 80;
    setItems((prev) => [...prev, { id, amount, offset }]);
    const t = setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 1800);
    return () => clearTimeout(t);
  }, [trigger]);
  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ y: 0, opacity: 0, scale: 0.5, x: item.offset }}
            animate={{ y: -70, opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ duration: 1.7, ease: "easeOut", times: [0, 0.15, 0.7, 1] }}
            className={"absolute whitespace-nowrap font-display text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] " + (item.amount >= 0 ? "text-emerald-400" : "text-rose-400")}
          >
            {item.amount >= 0 ? "+" : ""}£{Math.abs(item.amount).toLocaleString()}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}