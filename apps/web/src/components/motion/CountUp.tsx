import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function CountUp({
  to,
  suffix = '',
  duration = 1100,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : 0);
  const started = useRef(false);
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    const el = host.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - t) ** 3;
          setValue(Math.round(to * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [duration, reduced, to]);

  return (
    <span ref={host}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
