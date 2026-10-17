import React from "react";
import "@/components/game/zooArtwork.css";
import { PawPrint, Trees, Waves, Bird, Bug, Fish, HeartPulse, Leaf } from "lucide-react";

const scenes = {
  lion_savannah: { emoji: "🦁", secondary: "🌾", Icon: PawPrint },
  elephant_reserve: { emoji: "🐘", secondary: "🌿", Icon: PawPrint },
  giraffe_plains: { emoji: "🦒", secondary: "🌳", Icon: Trees },
  penguin_coast: { emoji: "🐧", secondary: "🧊", Icon: Waves },
  tropical_aviary: { emoji: "🦜", secondary: "🌴", Icon: Bird },
  reptile_house: { emoji: "🦎", secondary: "🍃", Icon: Bug },
  meerkat_dunes: { emoji: "🦦", secondary: "🏜️", Icon: PawPrint },
  red_panda_forest: { emoji: "🐾", secondary: "🎋", Icon: Trees },
  primate_island: { emoji: "🐒", secondary: "🌴", Icon: Trees },
  aquarium_dome: { emoji: "🐠", secondary: "🫧", Icon: Fish },
  wildlife_vet: { emoji: "🩺", secondary: "🐾", Icon: HeartPulse },
  conservation_centre: { emoji: "🌍", secondary: "🌱", Icon: Leaf },
};

export default function ZooArtwork({ attr, upgradeLevel = 0 }) {
  const scene = scenes[attr.id] || { emoji: "🐾", secondary: "🌿", Icon: PawPrint };
  const Icon = scene.Icon;
  return <div className={"zoo-art-scene zoo-art-" + attr.id} data-zoo-artwork={attr.id} data-upgrade-level={upgradeLevel}>
    <div className="zoo-art-sun" />
    <span className="zoo-art-land zoo-art-land-back" />
    <span className="zoo-art-land zoo-art-land-front" />
    <span className="zoo-art-foliage zoo-art-foliage-left">{scene.secondary}</span>
    <span className="zoo-art-foliage zoo-art-foliage-right">🌿</span>
    <span className="zoo-art-animal" aria-hidden="true">{scene.emoji}</span>
    <span className="zoo-art-building"><Icon size={14} strokeWidth={2.5} /></span>
    {upgradeLevel >= 3 && <span className="zoo-art-upgrade zoo-art-upgrade-one">✦</span>}
    {upgradeLevel >= 6 && <span className="zoo-art-upgrade zoo-art-upgrade-two">✦</span>}
    {upgradeLevel >= 9 && <span className="zoo-art-premium">★</span>}
  </div>;
}
