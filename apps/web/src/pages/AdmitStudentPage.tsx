import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Card } from '../components/layouts/Page';
import { useT } from '../hooks/useT';
import { api } from '../services/api';

type AdmitResult = {
  parentCreated: boolean;
  parentTemporaryPassword?: string;
  studentLoginEnabled: boolean;
  studentTemporaryPassword?: string;
  studentProfile: {
    studentIdNumber: string;
    gradeLevel: number;
    section: string;
    academicYear: string;
    isActive: boolean;
  };
  student: { name: string };
  parent: { name: string; phone?: string };
};

const emptyForm = {
  studentName: '',
  grade: '',
  section: '',
  academicYear: '',
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  enableStudentLogin: true,
};

export function AdmitStudentPage() {
  const t = useT();
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AdmitResult | null>(null);

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post<AdmitResult>('/students/admit', {
        studentName: form.studentName,
        grade: form.grade,
        section: form.section,
        academicYear: form.academicYear,
        parentName: form.parentName,
        parentPhone: form.parentPhone,
        parentEmail: form.parentEmail || undefined,
        enableStudentLogin: form.enableStudentLogin,
      });
      setResult(data);
    } catch (err) {
      if (axios.isAxiosError(err) && !err.response) {
        setError('Cannot reach the API. Keep npm run dev:api running, then try again.');
      } else if (axios.isAxiosError(err) && err.response?.status === 500) {
        setError('Database is waking up. Wait a few seconds and try again.');
      } else if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setError(err.response.data.message);
      } else {
        setError(t('admitOffice.error'));
      }
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <>
        <PageHeader title={t('admitOffice.success')} subtitle={t('admitOffice.hint')} />
        <Card>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Info label={t('admitOffice.studentName')} value={result.student.name} />
            <Info
              label="School ID"
              value={result.studentProfile.studentIdNumber}
            />
            <Info
              label={t('admitOffice.grade')}
              value={t('admitOffice.classLine', {
                grade: gradeLabel(result.studentProfile.gradeLevel),
                section: result.studentProfile.section,
                year: result.studentProfile.academicYear,
              })}
            />
            <Info label={t('admitOffice.parentName')} value={result.parent.name} />
            <Info
              label={t('admitOffice.parentPw', { password: result.parentTemporaryPassword ?? '—' })}
              value={
                result.parentCreated
                  ? result.parentTemporaryPassword ?? '—'
                  : 'Reused existing parent login'
              }
            />
            <Info
              label={t('admitOffice.studentPw', { password: result.studentTemporaryPassword ?? '—' })}
              value={
                result.studentLoginEnabled
                  ? result.studentTemporaryPassword ?? '—'
                  : 'Skipped'
              }
            />
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              onClick={() => {
                setResult(null);
                setForm(emptyForm);
              }}
            >
              {t('admitOffice.admitAnother')}
            </button>
            <Link
              to="/admin"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to People
            </Link>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('admitOffice.title')} subtitle={t('admitOffice.hint')} />
      <p className="mb-4 text-sm text-slate-500">
        <Link to="/admin/join-requests" className="text-teal-800 hover:underline">
          {t('nav.joinRequests')}
        </Link>
      </p>
      <Card>
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={onSubmit}>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-slate-900">{t('admitOffice.studentName')}</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field
                label={t('admitOffice.studentName')}
                value={form.studentName}
                onChange={(v) => set('studentName', v)}
                required
              />
              <Field
                label={t('admitOffice.grade')}
                placeholder="KG / 1–8 / Prep"
                value={form.grade}
                onChange={(v) => set('grade', v)}
                required
              />
              <Field
                label={t('admitOffice.section')}
                placeholder="A"
                value={form.section}
                onChange={(v) => set('section', v)}
                required
              />
              <Field
                label={t('admitOffice.year')}
                placeholder="2026-27"
                value={form.academicYear}
                onChange={(v) => set('academicYear', v)}
                required
              />
            </div>
          </fieldset>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-slate-900">{t('admitOffice.parentName')}</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field
                label={t('admitOffice.parentName')}
                value={form.parentName}
                onChange={(v) => set('parentName', v)}
                required
              />
              <Field
                label={t('admitOffice.parentPhone')}
                placeholder="Required"
                value={form.parentPhone}
                onChange={(v) => set('parentPhone', v)}
                required
              />
              <Field
                label={t('admitOffice.parentEmail')}
                placeholder="Optional"
                value={form.parentEmail}
                onChange={(v) => set('parentEmail', v)}
                type="email"
              />
              <label className="flex items-center gap-2 pt-6 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.enableStudentLogin}
                  onChange={(e) => set('enableStudentLogin', e.target.checked)}
                  className="rounded border-slate-300"
                />
                Enable student login (G5–Prep only)
              </label>
            </div>
          </fieldset>
          {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="btn-press rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {busy ? t('admitOffice.loading') : t('admitOffice.submit')}
            </button>
            <p className="mt-3 text-xs text-slate-500">
              Saving will create or reuse the parent, mint a student ID, and skip student login for
              lower grades.
            </p>
          </div>
        </form>
      </Card>
    </>
  );
}

function gradeLabel(level: number): string {
  if (level === 0) return 'KG';
  if (level === 9) return 'Prep';
  return `Grade ${level}`;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-400"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        type={type}
      />
    </label>
  );
}
