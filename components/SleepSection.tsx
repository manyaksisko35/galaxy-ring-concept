'use client';

import { useState } from 'react';

type Stage = 'awake' | 'rem' | 'light' | 'deep';

const LEVEL: Record<Stage, number> = { awake: 0, rem: 1, light: 2, deep: 3 };
const COLOR: Record<Stage, string> = { awake: '#f59e0b', rem: '#38bdf8', light: '#818cf8', deep: '#4338ca' };
const LABEL: Record<Stage, string> = { awake: 'Awake', rem: 'REM', light: 'Light', deep: 'Deep' };

const NIGHTS: { id: string; name: string; start: string; score: number; hr: number; temp: string; segs: [Stage, number][] }[] = [
  {
    id: 'great',
    name: 'Restful night',
    start: '23:10',
    score: 88,
    hr: 54,
    temp: '+0.1 °C',
    segs: [
      ['awake', 8], ['light', 25], ['deep', 55], ['light', 30], ['rem', 25], ['light', 35], ['deep', 40], ['light', 30],
      ['rem', 35], ['light', 40], ['deep', 20], ['light', 25], ['rem', 40], ['light', 20], ['awake', 5], ['rem', 20],
    ],
  },
  {
    id: 'short',
    name: 'Short night',
    start: '01:20',
    score: 64,
    hr: 61,
    temp: '+0.3 °C',
    segs: [['awake', 12], ['light', 30], ['deep', 40], ['light', 35], ['rem', 20], ['light', 40], ['deep', 15], ['light', 30], ['rem', 25], ['awake', 8]],
  },
  {
    id: 'restless',
    name: 'Restless night',
    start: '23:40',
    score: 58,
    hr: 66,
    temp: '+0.6 °C',
    segs: [
      ['awake', 20], ['light', 30], ['awake', 12], ['light', 25], ['deep', 25], ['light', 30], ['awake', 18], ['rem', 15],
      ['light', 40], ['awake', 10], ['light', 30], ['rem', 20], ['light', 25], ['awake', 15], ['rem', 15],
    ],
  },
];

const fmt = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;

export default function SleepSection() {
  const [id, setId] = useState(NIGHTS[0].id);
  const night = NIGHTS.find((n) => n.id === id) ?? NIGHTS[0];
  const total = night.segs.reduce((a, [, m]) => a + m, 0);
  const by = (s: Stage) => night.segs.filter(([x]) => x === s).reduce((a, [, m]) => a + m, 0);
  const asleep = total - by('awake');

  const W = 600;
  const H = 180;
  const rowH = H / 4;
  const bars = night.segs.reduce<{ s: Stage; x: number; w: number }[]>((acc, [s, m]) => {
    const prev = acc[acc.length - 1];
    acc.push({ s, x: prev ? prev.x + prev.w : 0, w: (m / total) * W });
    return acc;
  }, []);

  return (
    <section id="sleep" className="sg-ambient amb-night relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-6xl mx-auto">
        <p className="sg-eyebrow mb-3 lg:mb-5">Sleep</p>
        <h2 className="sg-title max-w-3xl">
          Wake up to <strong className="sg-ai">a better night.</strong>
        </h2>
        <p className="sg-lead mt-4 lg:mt-6 max-w-xl">
          The ring is light enough to forget at night, so it can follow every stage of your sleep, your heart rate and
          your skin temperature, then turn it into a Sleep Score with tips for tomorrow.
        </p>

        <div className="mt-8 inline-flex flex-wrap rounded-full border border-white/15 p-1 bg-black/40" role="radiogroup" aria-label="Example night">
          {NIGHTS.map((n) => (
            <button
              key={n.id}
              role="radio"
              aria-checked={n.id === id}
              onClick={() => setId(n.id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${n.id === id ? 'bg-white text-black font-semibold' : 'text-white/60 hover:text-white'}`}
            >
              {n.name}
            </button>
          ))}
        </div>

        <div className="mt-6 grid lg:grid-cols-[1.6fr_1fr] gap-4 lg:gap-6">
          <div className="sg-card p-5 lg:p-7">
            <div className="flex items-baseline justify-between mb-4">
              <p className="font-semibold">Sleep stages</p>
              <p className="text-sm text-white/50 tabular-nums">
                {night.start} · {fmt(total)}
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col justify-between text-[0.65rem] text-white/45 py-1" style={{ height: 180 }}>
                {(['awake', 'rem', 'light', 'deep'] as Stage[]).map((s) => (
                  <span key={s}>{LABEL[s]}</span>
                ))}
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="flex-1 h-[180px]" role="img" aria-label={`Hypnogram for a ${night.name.toLowerCase()}`}>
                {[1, 2, 3].map((i) => (
                  <line key={i} x1={0} x2={W} y1={i * rowH} y2={i * rowH} stroke="rgba(255,255,255,0.06)" />
                ))}
                {bars.map((b, i) => (
                  <rect
                    key={`${night.id}-${i}`}
                    x={b.x}
                    y={LEVEL[b.s] * rowH + 4}
                    width={Math.max(1, b.w - 1.5)}
                    height={rowH - 8}
                    rx={4}
                    fill={COLOR[b.s]}
                    className="sleep-bar"
                    style={{ animationDelay: `${i * 40}ms` }}
                  />
                ))}
              </svg>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/60">
              {(['deep', 'light', 'rem', 'awake'] as Stage[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <i className="w-2.5 h-2.5 rounded-sm" style={{ background: COLOR[s] }} />
                  {LABEL[s]} <span className="tabular-nums text-white/85">{fmt(by(s))}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 content-start">
            <div className="sg-card !rounded-2xl p-5 col-span-2 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/55">Sleep Score</p>
                <p className="text-5xl font-semibold tabular-nums sg-ai" aria-live="polite">
                  {night.score}
                </p>
              </div>
              <p className="text-sm text-white/55 text-right max-w-[11rem]">
                {night.score >= 80 ? 'Well rested. Keep this bedtime.' : night.score >= 62 ? 'Try going to bed a little earlier.' : 'A calm wind-down could help tonight.'}
              </p>
            </div>
            {[
              { k: 'Time asleep', v: fmt(asleep) },
              { k: 'Sleeping heart rate', v: `${night.hr} bpm` },
              { k: 'Skin temperature', v: night.temp },
              { k: 'Deep sleep', v: `${Math.round((by('deep') / asleep) * 100)}%` },
            ].map((s) => (
              <div key={s.k} className="sg-card !rounded-2xl px-4 py-3">
                <p className="text-[0.7rem] text-white/50">{s.k}</p>
                <p className="text-lg font-semibold tabular-nums">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-xs text-white/40 max-w-3xl">
          Example nights for illustration. Galaxy Ring is not a medical device and is not intended to diagnose or treat
          any condition.
        </p>
      </div>
    </section>
  );
}
