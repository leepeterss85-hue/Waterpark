import React from "react";
import { calculateResortStats } from "@/data/resort";
import ResortHeader from "./resort/ResortHeader";
import ResortStats from "./resort/ResortStats";
import ResortFacilities from "./resort/ResortFacilities";
import ResortHotelList from "./resort/ResortHotelList";

export default function ResortPanel({ resortRating, hotelStats, hotels, upgrades, grid, guests, reputation }) {
  const hasHotels = hotels.length > 0;
  const stats = calculateResortStats({ hotels, upgrades, grid, hotelStats, guests, reputation, resortRating });

  return (
    <div className="flex flex-col gap-3">
      <ResortHeader resortRating={resortRating} resortPopularity={stats.resortPopularity} />
      {hasHotels ? (
        <>
          <ResortStats stats={stats} hotelStats={hotelStats} />
          <div>
            <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Resort Facilities</div>
            <ResortFacilities facilities={stats.facilities} />
          </div>
          <div>
            <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Your Hotels & Upgrades</div>
            <ResortHotelList hotels={hotels} upgrades={upgrades} hotelStats={hotelStats} />
          </div>
        </>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-xs font-bold text-slate-400">No hotels built yet.</p>
          <p className="mt-1 text-[10px] font-medium text-slate-400">Open the Build menu and place a hotel to start your resort.</p>
        </div>
      )}
    </div>
  );
}