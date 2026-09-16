import { useState, type FormEvent } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useT } from '../../hooks/useT';
import { submitJoinRequest } from '../../hooks/useJoinRequests';
import { gradeLabel } from '../../lib/labels';

const GRADES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export function AdmissionsPage() {
  const t = useT();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [gradeLevel, setGradeLevel] = useState(1);
  const [section, setSection] = useState('');
  const [note, setNote] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await submitJoinRequest({
        studentName: studentName.trim(),
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        ...(parentEmail.trim() ? { parentEmail: parentEmail.trim() } : {}),
        gradeLevel,
        ...(section.trim() ? { section: section.trim() } : {}),
        note: note.trim(),
      });
      setSent(true);
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        setError(String((err.response.data as { message: string }).message));
      } else if (axios.isAxiosError(err) && !err.response) {
        setError(t('admissions.errNetwork'));
      } else {
        setError(t('admissions.errSend'));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">{t('admissions.eyebrow')}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{t('admissions.title')}</h1>
        <ol className="mt-8 list-decimal space-y-4 pl-5 text-stone-600">
          <li>{t('admissions.s1')}</li>
          <li>{t('admissions.s2')}</li>
          <li>{t('admissions.s3')}</li>
          <li>{t('admissions.s4')}</li>
        </ol>

        <h2 className="mt-12 font-serif text-2xl text-stone-900">{t('admissions.formTitle')}</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">{t('admissions.formHint')}</p>

        {sent ? (
          <p className="mt-8 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{t('admissions.thanks')}</p>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('admissions.studentName')}</span>
              <input
                required
                minLength={2}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('admissions.parentName')}</span>
              <input
                required
                minLength={2}
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-stone-700">{t('admissions.parentPhone')}</span>
                <input
                  required
                  minLength={9}
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone-700">{t('admissions.parentEmail')}</span>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-stone-700">{t('admissions.grade')}</span>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {gradeLabel(g)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone-700">{t('admissions.section')}</span>
                <input
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  placeholder="A"
                  maxLength={4}
                  className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">{t('admissions.note')}</span>
              <textarea
                required
                minLength={4}
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-stone-200 px-3 py-2"
              />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {busy ? t('admissions.sending') : t('admissions.submit')}
            </button>
          </form>
        )}

        <h2 className="mt-12 font-serif text-2xl text-stone-900">{t('admissions.reqTitle')}</h2>
        <p className="mt-3 text-base leading-relaxed text-stone-600">{t('admissions.reqBody')}</p>
        <p className="mt-8 text-sm text-stone-500">
          {t('admissions.orContact')}{' '}
          <Link to="/contact" className="font-medium text-blue-700 hover:underline">
            {t('admissions.cta')}
          </Link>
        </p>
      </div>
    </div>
  );
}
