import React from "react";
import { getAttraction } from "@/data/gameData";
import { getIcon } from "./icons";

export default function Tile({ value, index, selectedBuild, isSelected, onClick }) {
  const attr = value ? getAttraction(value) : null;
  const Icon = attr ? getIcon(attr.icon) : null;
  const canPlace = !attr && selectedBuild;

  return (
    <button
      onClick={onClick}
      className={`group relative flex aspect-square items-center justify-center rounded-xl transition-all duration-200 ${
        attr
          ? `bg-gradient-to-br ${attr.color} shadow-md ring-1 ring-white/40 ${
              isSelected ? "ring-4 ring-white scale-95" : "hover:scale-105"
            }`
          : canPlace
          ? "bg-sky-50 ring-1 ring-sky-200 hover:bg-sky-100 hover:ring-sky-300"
          : "bg-white/40 ring-1 ring-slate-100 hover:bg-white/70"
      }`}
      title={attr ? attr.name : canPlace ? "Place here" : "Empty lot"}
    >
      {attr && Icon ? (
        <Icon className="h-5 w-5 text-white drop-shadow-sm sm:h-6 sm:w-6" />
      ) : canPlace ? (
        <span className="text-sky-300 text-lg font-light">+</span>
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
      )}
    </button>
  );
}