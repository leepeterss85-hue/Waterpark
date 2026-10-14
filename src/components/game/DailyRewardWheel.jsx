import React, { useState } from "react";
import { PoundSterling, Coins, Star, TrendingUp, FlaskConical, ArrowUpCircle, Gift, Sparkles } from "lucide-react";
import { REWARD_TYPES, spinWheel, getStreakBonus, canClaimReward } from "@/data/dailyRewards";

const ICONS = { PoundSterling, Coins, Star, TrendingUp, FlaskConical, ArrowUpCircle, Gift };

export default function DailyRewardWheel({ day, lastRewardDay, streak, onClaim }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [angle, setAngle] = useState(0);
  const canClaim = canClaimReward(lastRewardDay, day);

  const handleSpin = () => {
    if (spinning || !canClaim) return;
    setSpinning(true);
    setResult(null);
    const reward = spinWheel();
    const segmentAngle = 360 / REWARD_TYPES.length;
    const idx = REWARD_TYPES.findIndex((r) => r.id === reward.id);
    const targetAngle = 360 * 5 + (360 - idx * segmentAngle - segmentAngle / 2);
    setAngle(targetAngle);
    setTimeout(() => {
      setResult(reward);
      setSpinning(false);
      const bonus = getStreakBonus(streak);
      const finalAmount = Math.round(reward.amount * bonus);
      onClaim({ ...reward, amount: finalAmount, streakBonus: bonus });
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 p-4 text-center">
        <div className="mb-1 flex items-center justify-center gap-2 text-sm font-black text-slate-700">
          <Sparkles className="h-4 w-4 text-amber-500" /> Daily Reward Wheel
        </div>
        <p className="text-xs text-slate-500">Spin once per day for bonus rewards. Keep your streak going for bigger prizes!</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <div className="flex flex-col items-center">
            <span className="font-black text-2xl text-violet-600">{streak || 0}</span>
            <span className="text-slate-500">Day Streak</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="font-black text-2xl text-amber-600">{getStreakBonus(streak || 0).toFixed(2)}×</span>
            <span className="text-slate-500">Streak Bonus</span>
          </div>
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[260px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative h-full w-full rounded-full border-4 border-slate-300 shadow-xl transition-transform"
            style={{ transform: `rotate(${angle}deg)`, transitionDuration: spinning ? "3s" : "0s", transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)" }}
          >
            {REWARD_TYPES.map((reward, i) => {
              const Icon = ICONS[reward.icon] || Gift;
              const segmentAngle = 360 / REWARD_TYPES.length;
              const rotate = i * segmentAngle;
              return (
                <div
                  key={reward.id}
                  className="absolute left-1/2 top-1/2 origin-bottom"
                  style={{ transform: `rotate(${rotate}deg) translateY(-50%)`, height: "50%", width: "2px" }}
                >
                  <div className={`absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 flex-col items-center justify-center rounded-full bg-gradient-to-br ${reward.color} shadow-md`}>
                    <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
          <div className="h-0 w-0 border-l-[8px] border-r-[8px] border-t-[16px] border-l-transparent border-r-transparent border-t-slate-800" />
        </div>
        <div className="absolute left-1/2 top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-300 bg-white shadow-md" />
      </div>

      {result && (
        <div className="animate-in fade-in zoom-in rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4 text-center ring-2 ring-amber-300">
          <div className="text-sm font-black text-amber-700">🎉 You won!</div>
          <div className="mt-1 text-lg font-black text-slate-800">{result.label}</div>
          {result.amount > 0 && (
            <div className="text-2xl font-black text-amber-600">+{result.amount.toLocaleString()}</div>
          )}
          {result.streakBonus > 1 && (
            <div className="text-xs font-bold text-violet-600">Streak bonus: {result.streakBonus}× applied!</div>
          )}
          {result.mysteryContent && (
            <div className="text-xs text-slate-500">Mystery reward: {result.mysteryContent.label}</div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleSpin}
        disabled={spinning || !canClaim}
        className="w-full rounded-xl bg-gradient-to-b from-violet-500 to-purple-600 py-3 text-sm font-black text-white shadow-lg transition active:translate-y-px disabled:opacity-40"
      >
        {spinning ? "Spinning..." : canClaim ? "🎰 Spin the Wheel!" : "✅ Come back next day!"}
      </button>
      {!canClaim && (
        <p className="text-center text-xs text-slate-400">You've already claimed today's reward. Spin again tomorrow!</p>
      )}
    </div>
  );
}