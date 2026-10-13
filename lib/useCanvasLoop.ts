'use client';

import { useEffect } from 'react';

export function useCanvasLoop(
  canvas: React.RefObject<HTMLCanvasElement | null>,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void,
  animate: boolean
) {
  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let visible = false;
    const frame = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, now / 1000);
      if (visible && animate) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    });
    io.observe(cv);
    const redraw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };
    cv.addEventListener('redraw', redraw);
    return () => {
      io.disconnect();
      cv.removeEventListener('redraw', redraw);
      cancelAnimationFrame(raf);
    };
  }, [canvas, draw, animate]);
}
