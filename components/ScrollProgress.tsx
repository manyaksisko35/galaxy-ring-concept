'use client';

import { useEffect, useRef } from 'react';

export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      ref={bar}
      className="fixed top-16 left-0 right-0 h-[2px] z-50 origin-left bg-[linear-gradient(90deg,var(--a1),var(--a2),var(--a3))]"
      style={{ transform: 'scaleX(0)' }}
    />
  );
}