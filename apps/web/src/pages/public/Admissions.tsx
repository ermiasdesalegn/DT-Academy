import { Link } from 'react-router-dom';

export function AdmissionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Admissions</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">How to apply</h1>
        <ol className="mt-8 list-decimal space-y-4 pl-5 text-stone-600">
          <li>Visit the office or send an inquiry through Contact.</li>
          <li>Bring the child’s name, grade, section preference, and a parent phone.</li>
          <li>The office admits the student and creates or reuses the parent login.</li>
          <li>KG–G4: parent portal only. G5–Prep may receive a student login.</li>
        </ol>
        <h2 className="mt-12 font-serif text-2xl text-stone-900">Requirements</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Parent phone is required. Email is optional. There is no public sign-up form that creates an account.
        </p>
        <h2 className="mt-12 font-serif text-2xl text-stone-900">Tuition</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">
          Fees are recorded as cash PNR or bank transfer and verified by the office. Until then the student stays
          locked. After you are admitted, submit a receipt from the family portal.
        </p>
        <Link to="/contact" className="mt-10 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          Contact the office
        </Link>
      </div>
    </div>
  );
}
