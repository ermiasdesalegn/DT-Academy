import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function Tilt3D({
  children,
  className = '',
  max = 11,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className={`relative rounded-2xl transition-transform duration-200 ease-out [transform-style:preserve-3d] ${className}`}
      onMouseMove={(e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        ref.current.style.transform = `rotateY(${x * max * 2.4}deg) rotateX(${-y * max}deg) translateZ(12px)`;
        if (glare.current) {
          glare.current.style.opacity = '1';
          glare.current.style.background = `radial-gradient(420px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(255,255,255,0.42), transparent 52%)`;
        }
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = '';
        if (glare.current) glare.current.style.opacity = '0';
      }}
    >
      {children}
      <div
        ref={glare}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
      />
    </div>
  );
}
