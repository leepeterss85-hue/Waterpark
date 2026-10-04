import {
  Waves,
  Sailboat,
  Droplets,
  Wind,
  Castle,
  Baby,
  UtensilsCrossed,
  Tent,
  Lock,
  ShoppingBag,
  HeartPulse,
  ShieldCheck,
  Wrench,
  Sparkles,
} from "lucide-react";

export const ICONS = {
  Waves,
  Sailboat,
  Droplets,
  Wind,
  Castle,
  Baby,
  UtensilsCrossed,
  Tent,
  Lock,
  ShoppingBag,
  HeartPulse,
  ShieldCheck,
  Wrench,
  Sparkles,
};

export function getIcon(name) {
  return ICONS[name] || Waves;
}