'use client';

import { useCallback, useRef } from 'react';
import { heroSpin, useDragSpin } from '@/lib/dragSpin';
import { startFilm } from '@/components/FilmTour';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const pick = useCallback(() => heroSpin, []);
  useDragSpin(ref, pick);

  return (
    <section
      ref={ref}
      id="overview"
      className="relative h-svh w-full flex flex-col items-center text-center px-4 pt-[15svh] lg:pt-[12svh] touch-pan-y select-none cursor-grab data-[dragging]:cursor-grabbing"
    >
      <p className="hero-in sg-eyebrow mb-4 lg:mb-5">Galaxy AI is here</p>
      <h1 className="hero-in hero-in--2 sg-title text-[12vw] lg:text-[6.5vw]">
        Galaxy <strong className="sg-ai">Ring</strong>
      </h1>
      <p className="hero-in hero-in--3 mt-3 lg:mt-4 text-base lg:text-2xl font-light text-white/70">
        All-day health, in a ring you forget you’re wearing.
      </p>
      <button onClick={startFilm} className="hero-in hero-in--3 sg-btn mt-5 lg:mt-6 inline-flex items-center gap-2.5">
        <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden>
          <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
        </svg>
        Watch the film
      </button>
      <div className="hero-in hero-in--4 absolute bottom-8 flex flex-col items-center gap-3 text-white/50">
        <span className="sg-eyebrow !text-[0.65rem]">Drag to spin · Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
      </div>
    </section>
  );
}
