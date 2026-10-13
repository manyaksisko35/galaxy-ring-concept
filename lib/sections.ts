'use client';

import { useEffect, useState } from 'react';

export type Section = { id: string; label: string; offset?: number };

export const SECTIONS: Section[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'design', label: 'Design', offset: 0.6 },
  { id: 'inside', label: 'Sensors', offset: 0.6 },
  { id: 'case', label: 'Charging case', offset: 0.6 },
  { id: 'sizes', label: 'Find your size' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'health', label: 'Energy Score' },
  { id: 'gestures', label: 'Double pinch' },
  { id: 'battery', label: 'Battery' },
  { id: 'colors', label: 'Colors' },
  { id: 'compare', label: 'Ring vs Watch' },
  { id: 'ecosystem', label: 'Galaxy ecosystem' },
  { id: 'specs', label: 'Specs' },
];

export function useActiveSection() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.5;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return active;
}

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);
