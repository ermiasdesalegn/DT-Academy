const SERVICES = [
  {
    title: 'School transport',
    body: 'Routes and pickup points are set by the office each term. Ask at the gate for the current list. It is not booked online.',
  },
  {
    title: 'After-school care',
    body: 'Supervised stay after the last bell, when the office has opened a group for that day. Families confirm with the class teacher.',
  },
  {
    title: 'Counselling',
    body: 'The office can arrange a talk with a counsellor for a parent or a child. Appointments are not walk-in public bookings.',
  },
  {
    title: 'Family portal',
    body: 'Once a child is admitted, the parent login is the place for attendance, reports, and tuition. KG to Grade 4 stay on the family login only.',
  },
];

export function ServicePage() {
  return (
    <div className="min-h-screen bg-[#f7f4ee]">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">Service</p>
        <h1 className="mt-3 text-4xl font-bold uppercase tracking-tight text-stone-900">How we serve families</h1>
        <p className="mt-6 max-w-2xl text-stone-600">
          Transport, after-school care, counselling, and the family portal. Ask the office for programme details.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {SERVICES.map((item) => (
            <article key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold uppercase text-[#1A2B3C]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
