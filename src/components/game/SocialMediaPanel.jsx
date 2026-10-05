import React from "react";
import { Camera, Video, Users, Flame, TrendingUp, TrendingDown, Share2, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { socialRepTier } from "@/data/socialMedia";

const PLATFORM_ICONS = { Camera, Video, Users, Flame };

function formatReach(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function SocialMediaPanel({ socialPosts, socialReputation }) {
  const tier = socialRepTier(socialReputation);
  const recentPosts = (socialPosts || []).slice(0, 20);
  const positiveCount = recentPosts.filter((p) => p.sentiment === "positive").length;
  const negativeCount = recentPosts.filter((p) => p.sentiment === "negative").length;
  const viralCount = recentPosts.filter((p) => p.viral).length;
  const totalReach = recentPosts.reduce((s, p) => s + (p.reach || 0), 0);
  const positivePct = recentPosts.length > 0 ? Math.round((positiveCount / recentPosts.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Reputation gauge */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Social Reputation</div>
            <div className={`text-3xl font-black ${tier.color}`}>{socialReputation ?? 50}<span className="text-base text-slate-400">/100</span></div>
          </div>
          <div className={`rounded-full bg-gradient-to-r ${tier.ring} px-3 py-1 text-xs font-black text-white shadow-md`}>
            {tier.label}
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full rounded-full bg-gradient-to-r ${tier.ring} transition-all`} style={{ width: `${socialReputation ?? 50}%` }} />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
          Social reputation drives visitor demand and ticket price tolerance. Keep guests happy to maintain a positive online presence.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-2 text-center shadow-sm">
          <Share2 className="mx-auto h-3.5 w-3.5 text-slate-400" />
          <div className="mt-0.5 text-sm font-black text-slate-900">{recentPosts.length}</div>
          <div className="text-[8px] font-bold uppercase text-slate-400">Posts</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-center shadow-sm">
          <ThumbsUp className="mx-auto h-3.5 w-3.5 text-emerald-500" />
          <div className="mt-0.5 text-sm font-black text-emerald-600">{positivePct}%</div>
          <div className="text-[8px] font-bold uppercase text-slate-400">Positive</div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-center shadow-sm">
          <ThumbsDown className="mx-auto h-3.5 w-3.5 text-rose-500" />
          <div className="mt-0.5 text-sm font-black text-rose-600">{recentPosts.length - positiveCount}</div>
          <div className="text-[8px] font-bold uppercase text-slate-400">Negative</div>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-2 text-center shadow-sm">
          <Sparkles className="mx-auto h-3.5 w-3.5 text-violet-500" />
          <div className="mt-0.5 text-sm font-black text-violet-600">{viralCount}</div>
          <div className="text-[8px] font-bold uppercase text-slate-400">Viral</div>
        </div>
      </div>

      {/* Post feed */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">Recent Posts</h3>
          <span className="text-[10px] font-bold text-slate-400">{formatReach(totalReach)} total reach</span>
        </div>
        {recentPosts.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">
            No posts yet. Open the park and attract guests to start generating social media buzz.
          </div>
        ) : (
          <div className="space-y-2">
            {recentPosts.map((post) => {
              const Icon = PLATFORM_ICONS[post.platform === "splashgram" ? "Camera" : post.platform === "wavetok" ? "Video" : post.platform === "parkbook" ? "Users" : "Flame"];
              const isPositive = post.sentiment === "positive";
              return (
                <div key={post.id} className={`rounded-xl border p-2.5 ${isPositive ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"} ${post.viral ? "ring-2 ring-violet-300" : ""}`}>
                  <div className="flex items-start gap-2">
                    <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${post.platformBadge || "bg-slate-100 text-slate-500"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-600">{post.platformName}</span>
                        <span className="text-[9px] text-slate-400">· Day {post.day}</span>
                        {post.viral && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-white">
                            <Sparkles className="h-2.5 w-2.5" /> Viral
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-slate-700">{post.text}</p>
                      <div className="mt-1 flex items-center gap-2 text-[9px] font-bold text-slate-400">
                        <span className={`inline-flex items-center gap-0.5 ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                          {isPositive ? "Positive" : "Negative"}
                        </span>
                        <span>· {formatReach(post.reach)} views</span>
                        {post.rideName && <span className="truncate">· 🎢 {post.rideName}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}