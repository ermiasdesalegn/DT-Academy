import { GraduationCap } from 'lucide-react';

export function ScreenLoader({ label = 'Opening DT Academy' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1A2B3C] px-6 text-white">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-white/15" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white" />
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1A2B3C]">
          <GraduationCap size={22} />
        </span>
      </div>
      <p className="mt-6 font-serif text-2xl tracking-tight">DT Academy</p>
      <p className="mt-2 text-sm text-white/60">{label}</p>
    </div>
  );
}
