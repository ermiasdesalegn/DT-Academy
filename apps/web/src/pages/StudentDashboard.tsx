import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck } from 'lucide-react';
import { PHOTOS } from '../lib/schoolPhotos';
import { useAuthStore } from '../store/authStore';

export function StudentDashboard() {
  const name = useAuthStore((s) => s.user?.name ?? 'Student');
  const first = name.split(' ')[0];

  return (
    <div className="bg-[#f7f4ee] pb-16">
      <section className="relative mx-4 mt-4 overflow-hidden rounded-[2rem] sm:mx-6">
        <img src={PHOTOS.hands} alt="" className="h-56 w-full object-cover object-[center_30%] sm:h-72" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B3C] via-[#1A2B3C]/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-6 py-8 sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Student portal</p>
          <h1 className="mt-1 font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl">Hi, {first}</h1>
          <p className="mt-2 max-w-lg text-sm text-white/75">
            Your report card appears after the Director signs the class sheet.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
              <BookOpen size={14} />
              Overall
            </p>
            <p className="mt-3 font-serif text-2xl text-stone-800">No marks yet</p>
            <p className="mt-2 text-sm text-stone-500">They appear when the Director approves your class sheet.</p>
          </div>
          <div className="rounded-[1.5rem] bg-teal-800 p-6 text-white shadow-sm">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-teal-100/80">
              <CalendarCheck size={14} />
              Attendance
            </p>
            <p className="mt-3 font-serif text-2xl">No roll yet</p>
            <p className="mt-2 text-sm text-teal-100/80">Present days show after teachers take attendance.</p>
          </div>
        </div>

        <p className="mt-8 text-sm text-stone-500">
          Questions about pickup or login go to the{' '}
          <Link to="/contact" className="font-medium text-teal-800 hover:underline">
            front office
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
