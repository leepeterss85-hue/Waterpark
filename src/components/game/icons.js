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
};

export function getIcon(name) {
  return ICONS[name] || Waves;
}