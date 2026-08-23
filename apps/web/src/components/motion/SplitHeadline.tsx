import { useReducedMotion } from '../../hooks/useReducedMotion';

export function SplitHeadline({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <h1 className={`${className} [perspective:700px]`} aria-label={text}>
      {text.split('').map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          aria-hidden
          className="hero-letter inline-block"
          style={{ animationDelay: `${80 + i * 45}ms` }}
        >
          {ch === ' ' ? '\u00a0' : ch}
        </span>
      ))}
    </h1>
  );
}
