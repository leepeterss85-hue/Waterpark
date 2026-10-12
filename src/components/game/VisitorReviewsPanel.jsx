import React from "react";
import { Star, MessageSquare, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { computeReviewStats } from "@/data/visitorReviews";

function Stars({ rating, size = "h-3.5 w-3.5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const isPositive = review.rating >= 4;
  const isNegative = review.rating <= 2;
  return (
    <div className={`rounded-xl border p-3 ${
      isPositive ? "border-emerald-100 bg-emerald-50/50"
      : isNegative ? "border-rose-100 bg-rose-50/50"
      : "border-slate-100 bg-slate-50/50"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white ${
            isPositive ? "bg-emerald-500" : isNegative ? "bg-rose-500" : "bg-slate-400"
          }`}>
            {review.author.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">{review.author}</p>
            <p className="text-[10px] text-slate-400">Day {review.day}</p>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">"{review.comment}"</p>
      {review.targetName && (
        <p className="mt-1.5 inline-block rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          {review.type === "attraction" ? "🎢" : "🏪"} {review.targetName}
        </p>
      )}
      {review.type === "park" && (
        <p className="mt-1.5 inline-block rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          🏖️ Park Overall
        </p>
      )}
    </div>
  );
}

export default function VisitorReviewsPanel({ reviews = [] }) {
  const stats = computeReviewStats(reviews);
  const recent = reviews.slice(0, 20);
  const positive = reviews.filter((r) => r.rating >= 4).length;
  const negative = reviews.filter((r) => r.rating <= 2).length;

  return (
    <div>
      {/* Overall rating summary */}
      <div className="mb-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 ring-1 ring-amber-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Park Rating</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-black text-slate-800">{stats.averageRating || "—"}</span>
              {stats.averageRating > 0 && <Stars rating={Math.round(stats.averageRating)} size="h-4 w-4" />}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-slate-400">{stats.totalReviews} reviews</p>
            <p className="mt-0.5 text-[10px] text-emerald-500">{positive} positive</p>
            <p className="text-[10px] text-rose-400">{negative} negative</p>
          </div>
        </div>
        {/* Rating breakdown bars */}
        {stats.totalReviews > 0 && (
          <div className="mt-3 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingBreakdown[star - 1];
              const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-3 text-[10px] font-bold text-slate-400">{star}</span>
                  <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-amber-100">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-[10px] font-semibold text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top & worst rated */}
      {stats.topRated && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Top Rated</p>
            </div>
            <p className="mt-1 truncate text-xs font-bold text-slate-700">{stats.topRated.name}</p>
            <div className="mt-0.5 flex items-center gap-1">
              <Stars rating={Math.round(stats.topRated.avg)} size="h-3 w-3" />
              <span className="text-[10px] text-slate-400">({stats.topRated.count})</span>
            </div>
          </div>
          {stats.worstRated && stats.worstRated.avg !== stats.topRated.avg && (
            <div className="rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100">
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                <p className="text-[10px] font-bold uppercase tracking-wide text-rose-600">Needs Work</p>
              </div>
              <p className="mt-1 truncate text-xs font-bold text-slate-700">{stats.worstRated.name}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <Stars rating={Math.round(stats.worstRated.avg)} size="h-3 w-3" />
                <span className="text-[10px] text-slate-400">({stats.worstRated.count})</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews list */}
      <div className="mb-2 flex items-center gap-1.5">
        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Reviews</h3>
      </div>
      {recent.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-6 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-slate-300" />
          <p className="mt-2 text-xs font-medium text-slate-400">No reviews yet — open your park and attract guests to get reviews!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recent.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
}