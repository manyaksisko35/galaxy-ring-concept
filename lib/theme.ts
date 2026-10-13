'use client';

import { useSyncExternalStore } from 'react';

export type Finish = {
  id: string;
  name: string;
  color: number;
  rough: number;
  swatch: string;
  accent: [string, string, string];
};

export const FINISHES: Finish[] = [
  { id: 'black', name: 'Titanium Black', color: 0x2b2c2f, rough: 0.22, swatch: 'linear-gradient(135deg,#55575c,#1d1e21)', accent: ['#eef0f2', '#aab1ba', '#6f7782'] },
  { id: 'silver', name: 'Titanium Silver', color: 0xc9ccd0, rough: 0.16, swatch: 'linear-gradient(135deg,#f2f4f6,#a7acb2)', accent: ['#e8f1fb', '#b5c8dc', '#7d93ab'] },
  { id: 'gold', name: 'Titanium Gold', color: 0xd8b36a, rough: 0.14, swatch: 'linear-gradient(135deg,#f6e2b0,#b8904a)', accent: ['#f8e7c2', '#d9b26a', '#a8813f'] },
];

export const DEFAULT_FINISH = FINISHES[2];
const KEY = 'ring-finish';

let current = DEFAULT_FINISH;
const listeners = new Set<() => void>();

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

function paint(b: Finish) {
  const s = document.documentElement.style;
  s.setProperty('--a1', b.accent[0]);
  s.setProperty('--a2', b.accent[1]);
  s.setProperty('--a3', b.accent[2]);
  s.setProperty('--a-rgb', rgb(b.accent[1]));
}

export function setFinish(id: string, save = true) {
  const b = FINISHES.find((x) => x.id === id);
  if (!b) return;
  current = b;
  paint(b);
  if (save) {
    try {
      localStorage.setItem(KEY, id);
    } catch {}
  }
  listeners.forEach((l) => l());
}

export function restoreFinish() {
  try {
    const id = localStorage.getItem(KEY);
    if (id && id !== current.id) setFinish(id, false);
  } catch {}
}

export const getFinish = () => current;

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useFinish() {
  return useSyncExternalStore(subscribe, getFinish, () => DEFAULT_FINISH);
}
