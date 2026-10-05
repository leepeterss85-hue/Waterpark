// Dynamic pricing system for the water park tycoon.
// Controls ticket, ride, food, hotel, VIP and event pricing with demand and mood effects.

export const DEFAULT_PRICING = {
  ridePriceMult: 1.0,    // 0.8x – 1.5x ride spend
  foodPriceMult: 1.0,    // 0.8x – 1.5x food/retail spend
  hotelPriceMult: 1.0,   // 0.8x – 1.5x hotel room price
  vipSurcharge: 0,       // 0 – 0.5 (0% – 50% extra for VIP guests)
  eventSurcharge: 0.1,   // 0 – 0.3 (0% – 30% extra during seasonal events)
  peakPricing: false,    // auto-adjust prices on peak/off-peak days
};

export const PRICE_PRESETS = [
  { label: "Budget", ridePriceMult: 0.85, foodPriceMult: 0.85, hotelPriceMult: 0.9, vipSurcharge: 0, eventSurcharge: 0.05 },
  { label: "Standard", ridePriceMult: 1.0, foodPriceMult: 1.0, hotelPriceMult: 1.0, vipSurcharge: 0.1, eventSurcharge: 0.1 },
  { label: "Premium", ridePriceMult: 1.2, foodPriceMult: 1.15, hotelPriceMult: 1.2, vipSurcharge: 0.25, eventSurcharge: 0.2 },
  { label: "Gouge", ridePriceMult: 1.5, foodPriceMult: 1.4, hotelPriceMult: 1.5, vipSurcharge: 0.4, eventSurcharge: 0.3 },
];

// Peak multiplier: higher on sunny/event days, lower on rain/storm days.
export function getPeakMultiplier(weather, seasonEvent) {
  if (weather?.id === "sunny") return 1.2;
  if (weather?.id === "storm" || weather?.id === "rain") return 0.85;
  if (seasonEvent) return 1.15;
  return 1.0;
}

// Adjust a per-visit spend based on pricing config, guest type, and conditions.
export function adjustedVisitSpend(basePrice, category, guestType, pricing, weather, seasonEvent) {
  if (!pricing) return basePrice;
  let price = basePrice;
  const peak = pricing.peakPricing ? getPeakMultiplier(weather, seasonEvent) : 1;
  price *= peak;
  if (category === "attraction") price *= pricing.ridePriceMult ?? 1;
  if (category === "facility") price *= pricing.foodPriceMult ?? 1;
  if (guestType === "VIP guest") price *= (1 + (pricing.vipSurcharge ?? 0));
  if (seasonEvent) price *= (1 + (pricing.eventSurcharge ?? 0));
  return price;
}

// Mood penalty from high prices (applied per simulation step, 0–10 scale).
export function pricingMoodPenalty(pricing) {
  if (!pricing) return 0;
  let penalty = 0;
  penalty += Math.max(0, (pricing.ridePriceMult - 1) * 8);
  penalty += Math.max(0, (pricing.foodPriceMult - 1) * 6);
  penalty += Math.max(0, (pricing.vipSurcharge - 0.1) * 3);
  penalty += Math.max(0, (pricing.eventSurcharge - 0.1) * 4);
  return Math.min(10, penalty);
}

// Hotel demand multiplier — high prices reduce occupancy.
export function hotelDemandMult(hotelPriceMult) {
  return Math.max(0.5, 1 - Math.max(0, (hotelPriceMult - 1) * 0.6));
}

// Ticket price demand multiplier — already handled by aggregatePriceReaction,
// but this returns a label for the UI.
export function priceTierLabel(ticketPrice) {
  if (ticketPrice <= 15) return "Budget";
  if (ticketPrice <= 28) return "Standard";
  if (ticketPrice <= 45) return "Premium";
  return "Luxury";
}