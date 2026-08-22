export function AcademicsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">Academics</p>
        <h1 className="mt-3 font-serif text-4xl text-stone-900">Early years, primary, and Prep</h1>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            ['Early years (KG)', 'Play, language, and first classroom habits. Pickup at the KG gate. Parent portal only.'],
            ['Primary (G1–G8)', 'Core literacy, numeracy, and subjects. G1–G4 stay on the family login.'],
            ['Secondary / Prep', 'Exam years. Student login may be enabled from Grade 5 when the office turns it on.'],
          ].map(([t, b]) => (
            <article key={t} className="border-t border-stone-200 pt-6">
              <h2 className="font-serif text-2xl text-stone-900">{t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{b}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
