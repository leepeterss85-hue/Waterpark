import {
  Waves, Sailboat, Droplets, Wind, Castle, Baby, UtensilsCrossed, Tent, Lock,
  ShoppingBag, HeartPulse, ShieldCheck, Wrench, Sparkles, Zap, Tornado, Users,
  Cloud, Sun, Flame, RotateCw, Mountain, Anchor, Dumbbell, Umbrella, IceCream,
  Coffee, Crown, CloudRain, Megaphone, Gem, Flag, CircleDot, Activity, Footprints,
  Flower2, Gamepad2, PartyPopper, Camera, Shield, Music, PersonStanding, Sprout,
  Star, TrendingUp, Trophy, Maximize2, CalendarDays, ToyBrick,
  Wine, Beef, CupSoda, Shirt, CreditCard, Pizza, Bath, Leaf, Thermometer, Moon,
  Briefcase, Trash2, Info, Droplet, Circle, Car,
  FerrisWheel, Ghost, Dices, Drama, Hammer, Target, Compass, Ship, Disc, Eye, Train, ArrowDown,
} from "lucide-react";

export const ICONS = {
  Waves, Sailboat, Droplets, Wind, Castle, Baby, UtensilsCrossed, Tent, Lock,
  ShoppingBag, HeartPulse, ShieldCheck, Wrench, Sparkles, Zap, Tornado, Users,
  Cloud, Sun, Flame, RotateCw, Mountain, Anchor, Dumbbell, Umbrella, IceCream,
  Coffee, Crown, CloudRain, Megaphone, Gem, Flag, CircleDot, Activity, Footprints,
  Flower2, Gamepad2, PartyPopper, Camera, Shield, Music, PersonStanding, Sprout,
  Star, TrendingUp, Trophy, Maximize2, CalendarDays, ToyBrick,
  Wine, Beef, CupSoda, Shirt, CreditCard, Pizza, Bath, Leaf, Thermometer, Moon,
  Briefcase, Trash2, Info, Droplet, Circle, Car,
  FerrisWheel, Ghost, Dices, Drama, Hammer, Target, Compass, Ship, Disc, Eye, Train, ArrowDown,
};

export function getIcon(name) {
  return ICONS[name] || Waves;
}