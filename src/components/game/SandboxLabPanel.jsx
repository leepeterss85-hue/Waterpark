import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beaker, Coins, Unlock, Users, Zap, CloudSun, RotateCcw } from "lucide-react";

export default function SandboxLabPanel({ game }) {
  const s = game.sandboxSettings || {};
  if (game.gameMode !== "sandbox") return <Card><CardContent className="p-5 text-center text-sm text-slate-500">Switch to Sandbox Mode to use the creative lab.</CardContent></Card>;
  const set = (patch) => game.updateSandboxSettings(patch);
  return <div className="space-y-3">
    <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-cyan-700"><Beaker className="h-4 w-4"/><span className="font-black">Sandbox Lab</span></div>
        <p className="mt-1 text-xs text-slate-500">Test the park without changing your normal Freeplay rules.</p>
      </CardContent>
    </Card>
    <Card><CardContent className="grid grid-cols-2 gap-2 p-3">
      <Button variant="outline" className="h-auto justify-start gap-2 py-3 text-left" onClick={()=>game.sandboxAction("cash")}><Coins className="h-4 w-4"/>Max cash</Button>
      <Button variant="outline" className="h-auto justify-start gap-2 py-3 text-left" onClick={()=>game.sandboxAction("unlock")}><Unlock className="h-4 w-4"/>Unlock research</Button>
      <Button variant="outline" className="h-auto justify-start gap-2 py-3 text-left" onClick={()=>game.sandboxAction("reputation")}><Zap className="h-4 w-4"/>Max reputation</Button>
      <Button variant="outline" className="h-auto justify-start gap-2 py-3 text-left" onClick={()=>game.sandboxAction("level")}><Unlock className="h-4 w-4"/>Level 40</Button>
      <Button variant="outline" className="h-auto justify-start gap-2 py-3 text-left" onClick={()=>game.sandboxAction("guests")}><Users className="h-4 w-4"/>1,000 peak guests</Button>
      <Button variant="outline" className="h-auto justify-start gap-2 py-3 text-left" onClick={()=>game.sandboxAction("clearConstruction")}><RotateCcw className="h-4 w-4"/>Clear projects</Button>
    </CardContent></Card>
    <Card><CardContent className="space-y-4 p-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-black"><span>Guest demand</span><span>{Number(s.guestDemandMult || 1).toFixed(1)}×</span></div>
        <input type="range" min="0.25" max="3" step="0.25" value={s.guestDemandMult || 1} onChange={e=>set({guestDemandMult:Number(e.target.value)})} className="w-full"/>
      </div>
      <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold"><span className="flex items-center gap-2"><Zap className="h-4 w-4"/>Instant construction</span><input type="checkbox" checked={!!s.instantConstruction} onChange={e=>set({instantConstruction:e.target.checked})}/></label>
      <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold"><span className="flex items-center gap-2"><CloudSun className="h-4 w-4"/>Lock weather</span><input type="checkbox" checked={!!s.weatherLock} onChange={e=>set({weatherLock:e.target.checked})}/></label>
      {s.weatherLock && <select value={s.weather || ""} onChange={e=>set({weather:e.target.value || null})} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold">
        <option value="">Use current forecast</option><option value="Sunny">Sunny</option><option value="Partly Cloudy">Partly Cloudy</option><option value="Cloudy">Cloudy</option><option value="Rain">Rain</option><option value="Storm">Storm</option>
      </select>}
      <Button variant="ghost" className="w-full" onClick={()=>game.sandboxAction("resetTools")}>Reset lab settings</Button>
    </CardContent></Card>
  </div>;
}
