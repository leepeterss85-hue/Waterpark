import React from "react";
import { Star, Hotel as HotelIcon, TrendingUp } from "lucide-react";

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={"h-5 w-5 " + (i < full ? "fill-amber-400 text-amber-400" : i === full && hasHalf ? "fill-amber-200 text-amber-400" : "text-white/30")}
        />
      ))}
      <span className="ml-1.5 text-sm font-black text-white">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ResortHeader({ resortRating, resortPopularity }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 p-4 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Resort Rating</div>
          <div className="mt-1"><StarRating rating={resortRating} /></div>
        </div>
        <HotelIcon className="h-10 w-10 text-white/30" />
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-white/70">
          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Resort Popularity</span>
          <span className="text-white">{resortPopularity}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-300 transition-all"
            style={{ width: `${resortPopularity}%` }}
          />
        </div>
      </div>
      <p className="mt-2 text-[10px] font-medium text-white/70">
        Hotel & waterpark operate as one unified resort.
      </p>
    </div>
  );
}