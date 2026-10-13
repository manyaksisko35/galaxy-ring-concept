'use client';

import { scrollToId } from '@/lib/lenis';
import { SECTIONS, useActiveSection } from '@/lib/sections';

export default function SectionDots() {
  const active = useActiveSection();
  const index = Math.max(0, SECTIONS.findIndex((s) => s.id === active));

  return (
    <nav
      aria-label="Sections"
      className="group/nav hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-2.5 py-3 pl-6 pr-2 rounded-2xl transition-colors duration-300 hover:bg-black/70"
    >
      <span aria-hidden className="absolute right-[11px] top-3 bottom-3 w-px bg-white/10" />
      <span
        aria-hidden
        className="absolute right-[11px] top-3 w-px bg-[linear-gradient(180deg,var(--a1),var(--a2))] transition-[height] duration-500"
        style={{ height: `calc((100% - 1.5rem) * ${(index + 0.5) / SECTIONS.length})` }}
      />
      {SECTIONS.map((s) => {
        const isActive = s.id === active;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-label={s.label}
            aria-current={isActive ? 'true' : undefined}
            onClick={(e) => {
              e.preventDefault();
              scrollToId(s.id, s.offset ?? 0);
            }}
            className="group/dot relative flex items-center justify-end h-3 gap-3"
          >
            <span
              className={`pointer-events-none whitespace-nowrap text-xs transition-all duration-200 opacity-0 translate-x-1 group-hover/nav:opacity-100 group-hover/nav:translate-x-0 group-hover/dot:!text-white ${
                isActive ? 'text-white font-semibold' : 'text-white/55'
              }`}
            >
              {s.label}
            </span>
            <span
              className={`relative block rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-1.5 h-5 bg-[linear-gradient(180deg,var(--a1),var(--a2))]'
                  : 'w-1.5 h-1.5 bg-white/30 group-hover/dot:bg-white/80'
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
