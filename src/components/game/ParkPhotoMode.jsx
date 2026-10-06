import React, { useState, useRef } from "react";
import { Camera, Download, Share2, Star, DollarSign, Users, CalendarDays, Trophy, Loader2 } from "lucide-react";

export default function ParkPhotoMode({ game }) {
  const [capturing, setCapturing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [error, setError] = useState(null);
  const targetRef = useRef(null);

  const handleCapture = async () => {
    setCapturing(true);
    setError(null);
    try {
      const html2canvas = (await import("html2canvas")).default;
      // Find the park grid element
      const gridEl = document.querySelector(".game-map-surface") || document.querySelector(".game-board-shell");
      if (!gridEl) {
        setError("Could not find the park map to capture.");
        setCapturing(false);
        return;
      }

      const canvas = await html2canvas(gridEl, {
        backgroundColor: "#7cc05a",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Create a stamped version with stats overlay
      const stamped = document.createElement("canvas");
      const ctx = stamped.getContext("2d");
      const stampH = 80;
      stamped.width = canvas.width;
      stamped.height = canvas.height + stampH;
      ctx.fillStyle = "#0f4c3b";
      ctx.fillRect(0, canvas.height, canvas.width, stampH);
      ctx.drawImage(canvas, 0, 0);

      // Park name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px Fredoka, Arial, sans-serif";
      ctx.fillText("Splash Tycoon", 20, canvas.height + 38);

      // Stats
      ctx.font = "bold 18px Inter, Arial, sans-serif";
      ctx.fillStyle = "#67e8f9";
      const stats = [
        `Day ${game.day}`,
        `$${game.money.toLocaleString()}`,
        `${game.guests.toLocaleString()} guests`,
        `${game.reputation}% rep`,
        `Lv ${game.level}`,
      ];
      let xPos = 20;
      for (const s of stats) {
        ctx.fillText(s, xPos, canvas.height + 64);
        xPos += ctx.measureText(s).width + 24;
      }

      const dataUrl = stamped.toDataURL("image/png");
      setPhotoUrl(dataUrl);
    } catch (e) {
      setError("Failed to capture photo. Try again.");
    }
    setCapturing(false);
  };

  const handleDownload = () => {
    if (!photoUrl) return;
    const a = document.createElement("a");
    a.href = photoUrl;
    a.download = `splash-tycoon-day-${game.day}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!photoUrl) return;
    try {
      const blob = await (await fetch(photoUrl)).blob();
      const file = new File([blob], `splash-tycoon-day-${game.day}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Splash Tycoon Park", text: `Check out my water park on Day ${game.day}!` });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Camera className="h-4 w-4 text-cyan-500" />
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Park Photo Mode</h3>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-slate-500">
        Capture a snapshot of your park with your current stats stamped on it. Download it or share it with friends!
      </p>

      {/* Stats preview */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-cyan-50 p-2 text-center ring-1 ring-cyan-100">
          <CalendarDays className="mx-auto h-4 w-4 text-cyan-500" />
          <p className="mt-0.5 text-sm font-black text-slate-700">{game.day}</p>
          <p className="text-[9px] font-semibold uppercase text-slate-400">Day</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2 text-center ring-1 ring-emerald-100">
          <DollarSign className="mx-auto h-4 w-4 text-emerald-500" />
          <p className="mt-0.5 text-sm font-black text-slate-700">${(game.money / 1000).toFixed(1)}k</p>
          <p className="text-[9px] font-semibold uppercase text-slate-400">Bank</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-2 text-center ring-1 ring-amber-100">
          <Users className="mx-auto h-4 w-4 text-amber-500" />
          <p className="mt-0.5 text-sm font-black text-slate-700">{game.guests.toLocaleString()}</p>
          <p className="text-[9px] font-semibold uppercase text-slate-400">Guests</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2 text-center ring-1 ring-rose-100">
          <Star className="mx-auto h-4 w-4 text-rose-500" />
          <p className="mt-0.5 text-sm font-black text-slate-700">{game.reputation}%</p>
          <p className="text-[9px] font-semibold uppercase text-slate-400">Rep</p>
        </div>
        <div className="rounded-lg bg-violet-50 p-2 text-center ring-1 ring-violet-100">
          <Trophy className="mx-auto h-4 w-4 text-violet-500" />
          <p className="mt-0.5 text-sm font-black text-slate-700">{game.level}</p>
          <p className="text-[9px] font-semibold uppercase text-slate-400">Level</p>
        </div>
        <div className="rounded-lg bg-fuchsia-50 p-2 text-center ring-1 ring-fuchsia-100">
          <Users className="mx-auto h-4 w-4 text-fuchsia-500" />
          <p className="mt-0.5 text-sm font-black text-slate-700">{game.peakGuests.toLocaleString()}</p>
          <p className="text-[9px] font-semibold uppercase text-slate-400">Peak</p>
        </div>
      </div>

      {/* Capture button */}
      <button
        onClick={handleCapture}
        disabled={capturing}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60"
      >
        {capturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        {capturing ? "Capturing..." : "Take Park Photo"}
      </button>

      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}

      {/* Photo preview */}
      {photoUrl && (
        <div className="mt-3">
          <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
            <img src={photoUrl} alt="Park snapshot" className="w-full" />
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleDownload}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}