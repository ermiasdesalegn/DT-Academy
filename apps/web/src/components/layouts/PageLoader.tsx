import { GraduationCap } from 'lucide-react';

export function PageLoader({
  label,
  variant = 'office',
  compact = false,
}: {
  label: string;
  variant?: 'office' | 'portal';
  compact?: boolean;
}) {
  const office = variant === 'office';
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl px-6 ${
        compact ? 'min-h-[12rem]' : 'min-h-[52vh]'
      } ${office ? 'border border-slate-200 bg-white' : 'bg-white/80 shadow-sm'}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className={`absolute inset-0 rounded-full border-2 ${office ? 'border-slate-200' : 'border-stone-200'}`} />
        <span
          className={`absolute inset-0 animate-spin rounded-full border-2 border-transparent ${
            office ? 'border-t-teal-800' : 'border-t-red-600'
          }`}
        />
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            office ? 'bg-teal-800 text-white' : 'bg-[#1A2B3C] text-white'
          }`}
        >
          <GraduationCap size={18} />
        </span>
      </div>
      <p className={`mt-5 text-sm ${office ? 'text-slate-500' : 'text-stone-500'}`}>{label}</p>
    </div>
  );
}
