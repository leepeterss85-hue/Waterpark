import React from "react";
import { Share2, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { socialRepTier } from "@/data/socialMedia";

function formatReach(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function SocialMediaCard({ socialPosts, socialReputation }) {
  const tier = socialRepTier(socialReputation);
  const recent = (socialPosts || []).slice(0, 3);
  const viralCount = (socialPosts || []).filter((p) => p.viral).length;
  const positivePct = (socialPosts || []).length > 0
    ? Math.round(((socialPosts || []).filter((p) => p.sentiment === "positive").length / (socialPosts || []).length) * 100)
    : 0;

  return (
    <div className="waterpark-panel p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${tier.ring} shadow-md`}>
          <Share2 className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-display text-base font-extrabold text-slate-900">Social Media</h3>
          <p className="text-[11px] text-slate-500">Online reputation & guest posts</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black ${tier.color}`}>{socialReputation ?? 50}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{tier.label}</div>
        </div>
        <div className="flex gap-2">
          <div className="rounded-lg bg-emerald-50 px-2 py-1 text-center">
            <TrendingUp className="mx-auto h-3 w-3 text-emerald-500" />
            <div className="text-xs font-black text-emerald-600">{positivePct}%</div>
          </div>
          <div className="rounded-lg bg-violet-50 px-2 py-1 text-center">
            <Sparkles className="mx-auto h-3 w-3 text-violet-500" />
            <div className="text-xs font-black text-violet-600">{viralCount}</div>
          </div>
        </div>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full bg-gradient-to-r ${tier.ring}`} style={{ width: `${socialReputation ?? 50}%` }} />
      </div>

      {recent.length > 0 ? (
        <div className="space-y-1.5">
          {recent.map((post) => {
            const isPositive = post.sentiment === "positive";
            return (
              <div key={post.id} className={`flex items-start gap-1.5 rounded-lg p-1.5 ${isPositive ? "bg-emerald-50" : "bg-rose-50"} ${post.viral ? "ring-1 ring-violet-300" : ""}`}>
                <span className={`mt-0.5 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] text-slate-600">{post.text}</p>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                    <span>{post.platformName}</span>
                    <span>· {formatReach(post.reach)} views</span>
                    {post.viral && <span className="text-violet-500">· VIRAL</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg bg-slate-50 p-3 text-center text-[11px] text-slate-400">
          No social posts yet. Attract guests to build your online presence.
        </div>
      )}
    </div>
  );
}