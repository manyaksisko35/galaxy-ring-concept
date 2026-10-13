'use client';

import { useState } from 'react';

const SIZES = [5, 6, 7, 8, 9, 10, 11, 12, 13];
const DIAMETER: Record<number, number> = { 5: 15.7, 6: 16.5, 7: 17.3, 8: 18.1, 9: 18.9, 10: 19.8, 11: 20.6, 12: 21.4, 13: 22.2 };

const weight = (size: number) => (2.3 + ((size - 5) / 8) * 0.7).toFixed(1);
const days = (size: number) => (size >= 12 ? 7 : 6);

export default function SizesSection() {
  const [size, setSize] = useState(8);
  const d = DIAMETER[size];
  const scale = 7.2;
  const inner = (d / 2) * scale;
  const outer = inner + 2.6 * scale;

  return (
    <section id="sizes" className="sg-ambient amb-accent relative z-10 bg-[#030303] px-6 lg:px-[8%] py-24 lg:py-32">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
        <div>
          <p className="sg-eyebrow mb-3 lg:mb-5">Find your size</p>
          <h2 className="sg-title">
            Nine sizes. <strong className="sg-ai">One that fits.</strong>
          </h2>
          <p className="sg-lead mt-4 lg:mt-6 max-w-md">
            Galaxy Ring comes in sizes 5 to 13. Samsung&apos;s Sizing Kit lets you wear a sample for a day before you
            choose, because the right fit makes the readings better.
          </p>
          <div className="mt-8 flex flex-wrap gap-2" role="radiogroup" aria-label="Ring size">
            {SIZES.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={s === size}
                onClick={() => setSize(s)}
                className={`w-11 h-11 rounded-full text-sm font-semibold tabular-nums border transition-colors ${
                  s === size ? 'bg-white text-black border-white' : 'border-white/20 text-white/70 hover:border-white/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-2 max-w-md">
            {[
              { k: 'Inner diameter', v: `${d.toFixed(1)} mm` },
              { k: 'Weight', v: `${weight(size)} g` },
              { k: 'Battery', v: `up to ${days(size)} days` },
            ].map((x) => (
              <div key={x.k} className="sg-card !rounded-2xl px-4 py-3">
                <dt className="text-[0.7rem] text-white/50">{x.k}</dt>
                <dd className="text-lg font-semibold tabular-nums mt-0.5" aria-live="polite">
                  {x.v}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-white/40 max-w-md">
            Diameters use the standard US ring size chart and weights are approximate, from 2.3 g (size 5) to 3.0 g
            (size 13). Sizes vary by market.
          </p>
        </div>

        <div className="flex justify-center">
          <svg viewBox="-110 -110 220 220" className="w-[min(80vw,420px)] h-auto" role="img" aria-label={`Size ${size}, ${d.toFixed(1)} millimeter inner diameter`}>
            <defs>
              <radialGradient id="ring-metal" cx="0.35" cy="0.3">
                <stop offset="0" stopColor="var(--a1)" />
                <stop offset="0.6" stopColor="var(--a2)" />
                <stop offset="1" stopColor="var(--a3)" />
              </radialGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((k) => (
              <circle key={k} r={100 * k} fill="none" stroke="rgba(255,255,255,0.05)" />
            ))}
            <circle r={(outer + inner) / 2} fill="none" stroke="url(#ring-metal)" strokeWidth={outer - inner} className="transition-all duration-500" />
            <circle r={inner} fill="none" stroke="#0b0b0c" strokeWidth={3} className="transition-all duration-500" />
            <line x1={-inner} x2={inner} y1={0} y2={0} stroke="rgba(255,255,255,0.45)" strokeDasharray="3 3" className="transition-all duration-500" />
            <text y={-6} textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
              {d.toFixed(1)} mm
            </text>
            <text y={16} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="9" letterSpacing="2">
              SIZE {size}
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
}
