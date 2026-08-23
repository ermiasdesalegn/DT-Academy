import { useEffect, useRef, useState } from 'react';

type Sub = {
  el: { current: HTMLElement | null };
  display: number;
  last: number;
  set: (n: number) => void;
};

const subs = new Set<Sub>();
let raf = 0;

function loop() {
  subs.forEach((s) => {
    const el = s.el.current;
    let target = s.display;
    if (el) {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const start = vh * 0.95;
      const end = -rect.height * 0.28;
      target = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
    }
    s.display += (target - s.display) * 0.14;
    if (Math.abs(target - s.display) < 0.001) s.display = target;
    const next = Math.round(s.display * 90) / 90;
    if (next !== s.last) {
      s.last = next;
      s.set(next);
    }
  });
  raf = requestAnimationFrame(loop);
}

function ensureLoop() {
  if (!raf) raf = requestAnimationFrame(loop);
}

/** Smooth 0–1 progress: target from layout, displayed value eases toward it. */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sub: Sub = { el: ref, display: 0, last: -1, set: setProgress };
    subs.add(sub);
    ensureLoop();
    return () => {
      subs.delete(sub);
      if (subs.size === 0 && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
  }, []);

  return { ref, progress };
}
