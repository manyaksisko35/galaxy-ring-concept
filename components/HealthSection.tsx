'use client';

import { useCallback, useRef, useState } from 'react';
import { useCanvasLoop } from '@/lib/useCanvasLoop';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { getFinish } from '@/lib/theme';

const C = 2 * Math.PI * 80;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function energyScore(sleep: number, activity: number, rhr: number) {
  const s = clamp(1 - Math.abs(sleep - 8) / 4, 0, 1);
  const a = clamp(1 - Math.abs(activity - 60) / 60, 0, 1);
  const h = clamp((80 - rhr) / 30, 0, 1);
  return Math.round(30 + s * 32 + a * 18 + h * 20);
}

const label = (n: number) => (n >= 85 ? 'Excellent' : n >= 70 ? 'Good' : n >= 55 ? 'Fair' : 'Low');

function Slider(props: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm mb-2">
        <span className="text-white/60">{props.label}</span>
        <span className="font-semibold tabular-nums">
          {props.value}
          <span className="text-white/45 font-normal"> {props.unit}</span>
        </span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(+e.target.value)}
        className="sg-range w-full"
      />
    </label>
  );
}

const CARDS = [
  { title: 'Heart rate alerts', text: 'A notification when your heart rate is unusually high or low.' },
  { title: 'Cycle tracking', text: 'Skin temperature helps predict your next cycle with Samsung Health.' },
  { title: 'Auto workout detection', text: 'Walks and runs are recognized and logged on their own.' },
];

export default function HealthSection() {
  const [sleep, setSleep] = useState(7.5);
  const [activity, setActivity] = useState(55);
  const [rhr, setRhr] = useState(58);
  const reduce = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const score = energyScore(sleep, activity, rhr);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      const bpm = rhr + 14;
      const period = 60 / bpm;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      const [a1, a2] = getFinish().accent;
      grad.addColorStop(0, `${a2}00`);
      grad.addColorStop(0.75, a2);
      grad.addColorStop(1, a1);
      ctx.strokeStyle = grad;
      ctx.beginPath();
      const span = 3.2;
      for (let x = 0; x <= w; x += 2) {
        const time = t - span + (x / w) * span;
        const ph = ((time % period) + period) % period / period;
        let y = 0;
        if (ph > 0.1 && ph < 0.14) y = -0.12;
        else if (ph > 0.18 && ph < 0.2) y = 0.15;
        else if (ph >= 0.2 && ph < 0.235) y = -1;
        else if (ph >= 0.235 && ph < 0.27) y = 0.35;
        else if (ph > 0.4 && ph < 0.5) y = -0.22 * Math.sin(((ph - 0.4) / 0.1) * Math.PI);
        const py = h * 0.55 + y * h * 0.38;
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    },
    [rhr]
  );
  useCanvasLoop(canvas, draw, !reduce);

  return (
    <section id="health" className="sg-ambient amb-accent relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto">
        <p className="sg-eyebrow mb-3 lg:mb-5">Health</p>
        <h2 className="sg-title max-w-3xl">
          Know how much <strong className="sg-ai">energy</strong> you have today.
        </h2>
        <p className="sg-lead mt-4 lg:mt-6 max-w-xl">
          Energy Score looks at last night&apos;s sleep, yesterday&apos;s activity and your heart rate while you slept.
          Move the sliders to see it change.
        </p>

        <div className="mt-10 lg:mt-14 grid lg:grid-cols-[1fr_1.2fr] gap-6 lg:gap-10 items-stretch">
          <div className="sg-card p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-48 aspect-square shrink-0">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" aria-hidden>
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#energy)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - score / 100)}
                  className="transition-[stroke-dashoffset] duration-500"
                />
                <defs>
                  <linearGradient id="energy" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" style={{ stopColor: 'var(--a1)' }} />
                    <stop offset="1" style={{ stopColor: 'var(--a3)' }} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center" aria-live="polite">
                <p className="text-5xl font-semibold tabular-nums">{score}</p>
                <p className="text-sm text-white/55">{label(score)}</p>
              </div>
            </div>
            <div className="w-full grid gap-5">
              <Slider label="Sleep" value={sleep} min={4} max={10} step={0.5} unit="h" onChange={setSleep} />
              <Slider label="Yesterday's activity" value={activity} min={0} max={120} step={5} unit="min" onChange={setActivity} />
              <Slider label="Sleeping heart rate" value={rhr} min={45} max={85} step={1} unit="bpm" onChange={setRhr} />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="sg-card !rounded-2xl p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">Heart rate</p>
                <p className="tabular-nums">
                  <span className="text-2xl font-semibold">{rhr + 14}</span>
                  <span className="text-white/50 text-sm"> bpm</span>
                </p>
              </div>
              <canvas ref={canvas} className="w-full h-20 mt-2" aria-hidden />
            </div>
            {CARDS.map((c) => (
              <div key={c.title} className="sg-card !rounded-2xl px-5 py-4">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-white/55 font-light mt-1">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-xs text-white/40 max-w-3xl">
          The score here is an illustration, not Samsung&apos;s algorithm. Health features are not for diagnosing or
          treating any condition, and availability varies by market and device.
        </p>
      </div>
    </section>
  );
}
