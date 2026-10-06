import React, { useState } from "react";
import { Volume2, VolumeX, Vibrate, VibrateOff, Play, RotateCcw, Save, SlidersHorizontal, HardHat, ArrowLeft, Sparkles, Ban, Cloud, Mail, MailOpen } from "lucide-react";
import { sound } from "@/lib/soundManager";
import { getSettings, saveSettings, haptics, DIFFICULTIES } from "@/lib/settings";
import SaveLoadPanel from "@/components/game/SaveLoadPanel";
import CloudSavesPanel from "@/components/game/CloudSavesPanel";
import StarterParkPicker from "@/components/game/StarterParkPicker";

function Row({ icon: Icon, title, desc, children }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-extrabold text-slate-800">{title}</div>
        {desc && <div className="text-[10px] font-medium text-slate-500">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onClick, onIcon: OnIcon, offIcon: OffIcon, onTone = "text-cyan-300", offTone = "text-white/45" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black ring-1 transition ${on ? "bg-cyan-500/15 text-cyan-700 ring-cyan-200" : "bg-slate-100 text-slate-500 ring-slate-200"}`}
    >
      {on ? <OnIcon className={`h-4 w-4 ${onTone}`} /> : <OffIcon className={`h-4 w-4 ${offTone}`} />}
      {on ? "On" : "Off"}
    </button>
  );
}

export default function SettingsPanel({ saves, onSave, onLoad, onDelete, onNewGame, onContinue, sandbox, onToggleSandbox, loadFromCloud }) {
  const [soundOn, setSoundOn] = useState(!sound.isMuted());
  const [vibrationOn, setVibrationOn] = useState(haptics.isEnabled());
  const [difficulty, setDifficulty] = useState(getSettings().difficulty);
  const [emailAlerts, setEmailAlerts] = useState(getSettings().emailAlerts !== false);
  const [showParkPicker, setShowParkPicker] = useState(false);

  const toggleSound = () => {
    const m = sound.toggle();
    setSoundOn(!m);
    if (!m) sound.click();
    haptics.buzz(15);
  };

  const toggleVibration = () => {
    const next = !vibrationOn;
    haptics.setEnabled(next);
    saveSettings({ vibration: next });
    setVibrationOn(next);
    if (next) haptics.buzz(25);
  };

  const chooseDifficulty = (id) => {
    saveSettings({ difficulty: id });
    setDifficulty(id);
    haptics.buzz(15);
    sound.click();
  };

  const toggleEmailAlerts = () => {
    const next = !emailAlerts;
    saveSettings({ emailAlerts: next });
    setEmailAlerts(next);
    haptics.buzz(15);
    sound.click();
  };

  const handleNewGame = () => {
    setShowParkPicker(true);
  };

  const handlePickPark = (parkId) => {
    haptics.buzz(30);
    onNewGame(parkId);
    setShowParkPicker(false);
  };

  if (showParkPicker) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setShowParkPicker(false)}
          className="flex items-center gap-1.5 self-start text-xs font-bold text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
          <RotateCcw className="h-3.5 w-3.5" /> New Game · Choose a Park
        </div>
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-600 ring-1 ring-amber-100">Starting a new park wipes your current one. Save first if you want to keep it.</p>
        <StarterParkPicker onPick={handlePickPark} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
          <Play className="h-3.5 w-3.5" /> Game
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleNewGame}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-3 py-3 text-xs font-black text-white shadow-sm transition hover:from-emerald-300 hover:to-emerald-500"
          >
            <RotateCcw className="h-4 w-4" /> New Game
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-3 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <Play className="h-4 w-4" /> Continue
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
          <Save className="h-3.5 w-3.5" /> Save Slots
        </div>
        <SaveLoadPanel saves={saves} onSave={onSave} onLoad={onLoad} onDelete={onDelete} />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
          <Cloud className="h-3.5 w-3.5" /> Cloud Saves
        </div>
        <CloudSavesPanel onLoadCloud={loadFromCloud} />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Audio & Feedback
        </div>
        <div className="flex flex-col gap-2">
          <Row icon={soundOn ? Volume2 : VolumeX} title="Sound Effects" desc="Clicks, cash and splash cues">
            <Toggle on={soundOn} onClick={toggleSound} onIcon={Volume2} offIcon={VolumeX} />
          </Row>
          <Row icon={Vibrate} title="Vibration" desc="Haptic feedback on supported devices">
            <Toggle on={vibrationOn} onClick={toggleVibration} onIcon={Vibrate} offIcon={VibrateOff} />
          </Row>
          <Row icon={emailAlerts ? Mail : MailOpen} title="Email Alerts" desc="Get notified about level-ups and milestones">
            <Toggle on={emailAlerts} onClick={toggleEmailAlerts} onIcon={Mail} offIcon={MailOpen} />
          </Row>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
          <HardHat className="h-3.5 w-3.5" /> Difficulty
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => {
            const active = difficulty === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => chooseDifficulty(d.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition ${active ? "border-cyan-400 bg-cyan-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <span className={`text-xs font-black ${active ? "text-cyan-700" : "text-slate-700"}`}>{d.label}</span>
                <span className="text-[9px] font-medium leading-tight text-slate-500">{d.desc}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-[10px] font-semibold text-slate-400">Difficulty applies to the next New Game.</p>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
          <Sparkles className="h-3.5 w-3.5" /> Sandbox
        </div>
        <Row icon={Sparkles} title="Sandbox Mode" desc="Unlimited money, no incidents, no disasters">
          <Toggle on={!!sandbox} onClick={onToggleSandbox} onIcon={Sparkles} offIcon={Ban} />
        </Row>
        <p className="mt-1.5 text-[10px] font-semibold text-slate-400">Free building with no costs or negative events. Toggles instantly.</p>
      </div>
    </div>
  );
}