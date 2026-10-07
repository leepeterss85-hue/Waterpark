import React, { useState } from "react";
import { Ticket, Waves, Utensils, Hotel, Crown, Sparkles, Sun, TrendingUp, TrendingDown } from "lucide-react";
import { PRICE_PRESETS, getPeakMultiplier, priceTierLabel } from "@/data/pricing";

function Slider({ icon: Icon, label, value, min, max, step, format, onChange, tone }) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700">
          <Icon className={`h-3.5 w-3.5 ${tone || "text-slate-500"}`} />
          {label}
        </div>
        <span className="font-display text-sm font-extrabold text-slate-900">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-2 w-full accent-cyan-500"
      />
    </div>
  );
}

export default function PricingPanel({ pricing, ticketPrice, weather, seasonEvent, onChange, onTicketChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const peak = getPeakMultiplier(weather, seasonEvent);
  const isPeak = peak > 1;
  const isOffPeak = peak < 1;
  const tier = priceTierLabel(ticketPrice);\n  const pricingAdvice = isPeak && ticketPrice < 28\n    ? "Demand is strong today. Consider a modest ticket increase before raising ride prices."\n    : isOffPeak && ticketPrice > 35\n    ? "Demand is soft today. A lower gate price can recover attendance and improve secondary spending."\n    : pricing.ridePriceMult > 1.2 && pricing.foodPriceMult > 1.2\n    ? "Both ride and food prices are high. Watch guest mood and queue demand closely."\n    : pricing.hotelPriceMult > 1.25 && isOffPeak\n    ? "Hotel pricing is premium for an off-peak period. A small reduction may improve occupancy."\n    : "Pricing is broadly balanced. Watch demand and guest satisfaction before making another change.";

  const applyPreset = (preset) => {
    onChange({ ...pricing, ...preset });
  };

  const setField = (field, value) => {
    onChange({ ...pricing, [field]: value });
  };

  return (
    <section className="waterpark-panel bg-white/85 p-4">
      <div className="mb-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Revenue control</div>
        <h3 className="font-display text-lg font-extrabold text-slate-900">Dynamic pricing</h3>
        <p className="mt-1 text-[11px] leading-4 text-slate-500">
          Adjust prices to balance revenue against demand and guest happiness. Higher prices earn more per visit but reduce attendance and mood.
        </p>
      </div>

      {/* Peak / off-peak indicator */}
      <div className={`mb-3 flex items-center justify-between rounded-xl p-3 ring-1 ${isPeak ? "bg-amber-50 ring-amber-200" : isOffPeak ? "bg-sky-50 ring-sky-200" : "bg-slate-50 ring-slate-200"}`}>
        <div className="flex items-center gap-2">
          <Sun className={`h-4 w-4 ${isPeak ? "text-amber-500" : isOffPeak ? "text-sky-500" : "text-slate-400"}`} />
          <div>
            <div className="text-[11px] font-extrabold text-slate-700">
              {isPeak ? "Peak day" : isOffPeak ? "Off-peak day" : "Standard day"}
            </div>
            <div className="text-[10px] text-slate-500">
              {seasonEvent ? seasonEvent.name : weather?.name || "Clear"} · {peak > 1 ? `+${Math.round((peak - 1) * 100)}% demand` : peak < 1 ? `${Math.round((peak - 1) * 100)}% demand` : "Normal demand"}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400">Peak auto-pricing</div>
          <button
            onClick={() => setField("peakPricing", !pricing.peakPricing)}
            className={`mt-0.5 rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${pricing.peakPricing ? "bg-emerald-500 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
          >
            {pricing.peakPricing ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-start gap-2 rounded-xl bg-indigo-50 p-3 ring-1 ring-indigo-100">\n        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />\n        <div><div className="text-[10px] font-black uppercase tracking-wide text-indigo-600">Pricing advisor</div><div className="mt-0.5 text-[10px] leading-4 text-indigo-800">{pricingAdvice}</div></div>\n      </div>\n\n      {/* Ticket price */}
      <div className="mb-3 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800">
            <Ticket className="h-4 w-4" /> Gate admission
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[9px] font-black text-emerald-800">{tier}</span>
            <span className="font-display text-lg font-extrabold text-slate-900">${ticketPrice}</span>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[15, 20, 28, 35, 45, 60].map((v) => (
            <button
              key={v}
              onClick={() => onTicketChange(v)}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold transition ${ticketPrice === v ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"}`}
            >
              ${v}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-slate-500">
          {ticketPrice <= 20 ? "Budget-friendly — high demand, lower revenue per guest." : ticketPrice <= 35 ? "Standard pricing — balanced demand and revenue." : ticketPrice <= 50 ? "Premium pricing — fewer budget guests, higher spend." : "Luxury pricing — only VIP and tourist guests will pay."}
        </div>
      </div>

      {/* Price presets */}
      <div className="mb-3">
        <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Quick presets</div>
        <div className="grid grid-cols-4 gap-1.5">
          {PRICE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="rounded-lg bg-white px-2 py-2 text-[10px] font-extrabold text-slate-600 ring-1 ring-slate-200 transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ride & food pricing sliders */}
      <div className="grid grid-cols-1 gap-2">
        <Slider
          icon={Waves}
          label="Ride pricing"
          value={pricing.ridePriceMult}
          min={0.8}
          max={1.5}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => setField("ridePriceMult", v)}
          tone="text-cyan-500"
        />
        <Slider
          icon={Utensils}
          label="Food & shop pricing"
          value={pricing.foodPriceMult}
          min={0.8}
          max={1.5}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => setField("foodPriceMult", v)}
          tone="text-amber-500"
        />
        <Slider
          icon={Hotel}
          label="Hotel room pricing"
          value={pricing.hotelPriceMult}
          min={0.8}
          max={1.5}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
          onChange={(v) => setField("hotelPriceMult", v)}
          tone="text-violet-500"
        />
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="mt-3 w-full rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-extrabold text-slate-600 transition hover:bg-slate-200"
      >
        {showAdvanced ? "Hide advanced pricing" : "Show advanced pricing"}
      </button>

      {showAdvanced && (
        <div className="mt-2 grid grid-cols-1 gap-2">
          <Slider
            icon={Crown}
            label="VIP surcharge"
            value={pricing.vipSurcharge}
            min={0}
            max={0.5}
            step={0.05}
            format={(v) => `+${Math.round(v * 100)}%`}
            onChange={(v) => setField("vipSurcharge", v)}
            tone="text-violet-500"
          />
          <Slider
            icon={Sparkles}
            label="Event surcharge"
            value={pricing.eventSurcharge}
            min={0}
            max={0.3}
            step={0.05}
            format={(v) => `+${Math.round(v * 100)}%`}
            onChange={(v) => setField("eventSurcharge", v)}
            tone="text-rose-500"
          />
          <div className="rounded-xl bg-slate-50 p-2.5 text-[10px] text-slate-500 ring-1 ring-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-600">
              {pricing.ridePriceMult > 1.2 || pricing.foodPriceMult > 1.2 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-amber-500" />}
              Pricing impact
            </div>
            <div className="mt-1">
              {pricing.ridePriceMult > 1.2 || pricing.foodPriceMult > 1.2
                ? "High prices boost revenue per visit but reduce guest mood and demand."
                : pricing.ridePriceMult < 0.95 || pricing.foodPriceMult < 0.95
                ? "Low prices attract more guests but reduce profit margins."
                : "Balanced pricing — steady revenue and satisfaction."}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}