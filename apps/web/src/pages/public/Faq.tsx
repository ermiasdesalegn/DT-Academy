export function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">FAQ</p>
        <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight text-stone-900">Common questions</h1>
        <dl className="mt-10 space-y-6 text-stone-600">
          <div>
            <dt className="font-semibold text-stone-900">How do I get a login?</dt>
            <dd className="mt-1">The office creates accounts at admission. There is no public sign-up.</dd>
          </div>
          <div>
            <dt className="font-semibold text-stone-900">KG–G4 student login?</dt>
            <dd className="mt-1">No. Those grades use the parent portal only.</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
