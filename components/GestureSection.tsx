'use client';

import { useState } from 'react';

type Mode = 'camera' | 'alarm';

export default function GestureSection() {
  const [mode, setMode] = useState<Mode>('camera');
  const [shots, setShots] = useState(0);
  const [flash, setFlash] = useState(0);
  const [alarmOn, setAlarmOn] = useState(true);
  const [pinch, setPinch] = useState(0);

  const doublePinch = () => {
    setPinch((p) => p + 1);
    if (mode === 'camera') {
      setShots((s) => s + 1);
      setFlash((f) => f + 1);
    } else {
      setAlarmOn((on) => !on);
    }
  };

  return (
    <section id="gestures" className="sg-ambient amb-accent relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <p className="sg-eyebrow mb-3 lg:mb-5">Double pinch</p>
          <h2 className="sg-title">
            Tap your fingers. <strong className="sg-ai">Done.</strong>
          </h2>
          <p className="sg-lead mt-4 lg:mt-6 max-w-md">
            Pinch your thumb and ring finger together twice to take a photo on your Galaxy phone or turn off an alarm,
            without reaching for the screen.
          </p>
          <div className="mt-8 inline-flex rounded-full border border-white/15 p-1 bg-black/40" role="radiogroup" aria-label="Gesture action">
            {(['camera', 'alarm'] as Mode[]).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={mode === m}
                onClick={() => {
                  setMode(m);
                  setAlarmOn(true);
                }}
                className={`rounded-full px-5 py-2 text-sm transition-colors ${mode === m ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'}`}
              >
                {m === 'camera' ? 'Take a photo' : 'Stop an alarm'}
              </button>
            ))}
          </div>
          <button onClick={doublePinch} className="mt-6 sg-btn gap-3">
            <span className="pinch-icon" key={pinch} aria-hidden>
              <i />
              <i />
            </span>
            Double pinch
          </button>
          <p className="mt-4 text-xs text-white/40 max-w-md">Works with compatible Galaxy phones. Illustration.</p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-[min(70vw,280px)] aspect-[9/19] rounded-[42px] border-[6px] border-[#1d1e21] bg-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] overflow-hidden" aria-live="polite">
            {mode === 'camera' ? (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#1e3a5f_0%,#f59e0b_55%,#7c2d12_70%,#111_100%)]" />
                <div className="absolute inset-x-0 top-[48%] h-[22%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,220,150,0.9),transparent_60%)]" />
                <div className="absolute left-1/2 top-[22%] -translate-x-1/2 w-[36%] aspect-square border border-white/50 rounded-sm" />
                <div className="absolute bottom-0 inset-x-0 h-[22%] bg-black/70 flex items-center justify-around px-6">
                  <span className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xs tabular-nums">{shots}</span>
                  <span className="w-14 h-14 rounded-full border-4 border-white bg-white/90" />
                  <span className="w-10 h-10" />
                </div>
                {flash > 0 && <div key={flash} className="pinch-flash absolute inset-0 bg-white" />}
              </>
            ) : (
              <div className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-colors duration-500 ${alarmOn ? 'bg-[#1a1209]' : 'bg-[#0b1220]'}`}>
                {alarmOn ? (
                  <>
                    <p className="text-sm text-white/60">Alarm</p>
                    <p className="text-6xl font-light tabular-nums mt-1">07:00</p>
                    <p className="mt-6 text-xs text-white/50">Double pinch to stop</p>
                    <span className="mt-6 w-16 h-16 rounded-full bg-[var(--a2)]/30 border border-[var(--a2)] animate-pulse" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-semibold">Good morning</p>
                    <p className="mt-2 text-sm text-white/60">Sleep Score 88 · Energy Score 82</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
