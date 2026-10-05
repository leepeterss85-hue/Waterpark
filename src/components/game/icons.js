import {
  Waves, Sailboat, Droplets, Wind, Castle, Baby, UtensilsCrossed, Tent, Lock,
  ShoppingBag, HeartPulse, ShieldCheck, Wrench, Sparkles, Zap, Tornado, Users,
  Cloud, Sun, Flame, RotateCw, Mountain, Anchor, Dumbbell, Umbrella, IceCream,
  Coffee, Crown, CloudRain, Megaphone, Gem, Flag, CircleDot, Activity, Footprints,
  Flower2, Gamepad2, PartyPopper, Camera, Shield, Music, PersonStanding, Sprout,
  Star, TrendingUp, Trophy, Maximize2, CalendarDays, ToyBrick,
  Wine, Beef, CupSoda, Shirt, CreditCard, Pizza, Bath, Leaf, Thermometer, Moon,
} from "lucide-react";

export const ICONS = {
  Waves, Sailboat, Droplets, Wind, Castle, Baby, UtensilsCrossed, Tent, Lock,
  ShoppingBag, HeartPulse, ShieldCheck, Wrench, Sparkles, Zap, Tornado, Users,
  Cloud, Sun, Flame, RotateCw, Mountain, Anchor, Dumbbell, Umbrella, IceCream,
  Coffee, Crown, CloudRain, Megaphone, Gem, Flag, CircleDot, Activity, Footprints,
  Flower2, Gamepad2, PartyPopper, Camera, Shield, Music, PersonStanding, Sprout,
  Star, TrendingUp, Trophy, Maximize2, CalendarDays, ToyBrick,
  Wine, Beef, CupSoda, Shirt, CreditCard, Pizza, Bath, Leaf, Thermometer, Moon,
};

export function getIcon(name) {
  return ICONS[name] || Waves;
}