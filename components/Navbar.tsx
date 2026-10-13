'use client';

import { useState } from 'react';
import { scrollToId } from '@/lib/lenis';
import { sectionById } from '@/lib/sections';

const LINKS = [
  { id: 'design', label: 'Design' },
  { id: 'sizes', label: 'Sizes' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'health', label: 'Health' },
  { id: 'battery', label: 'Battery' },
  { id: 'compare', label: 'Compare' },
  { id: 'specs', label: 'Specs' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id, sectionById(id)?.offset ?? 0);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 px-5 lg:px-12 flex items-center justify-between bg-black/85 border-b border-white/10">
      <a href="#overview" onClick={(e) => go(e, 'overview')} className="text-base lg:text-lg font-semibold tracking-[0.3em]">
        SAMSUNG
      </a>
      <nav className="hidden lg:flex gap-9 text-sm">
        {LINKS.map((l) => (
          <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)} className="text-white/60 hover:text-white transition-colors">
            {l.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <a href="#colors" onClick={(e) => go(e, 'colors')} className="rounded-full bg-white text-black text-sm font-semibold px-4 py-2">
          Buy now
        </a>
        <button
          className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`block h-px w-5 bg-white transition-transform ${open ? 'translate-y-[3.5px] rotate-45' : ''}`} />
          <span className={`block h-px w-5 bg-white transition-transform ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
        </button>
      </div>
      {open && (
        <nav className="lg:hidden absolute top-16 inset-x-0 bg-black/95 border-b border-white/10 flex flex-col py-2">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)} className="px-6 py-3 text-lg">
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
