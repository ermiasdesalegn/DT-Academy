import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Card } from '../components/layouts/Page';
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
        setError('Could not save this admission. Check the form and try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <>
        <PageHeader
          title="Admission saved"
          subtitle="Share the school ID with the office file. Tuition still has to be verified before the student is active."
        />
        <Card>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Info label="Student" value={result.student.name} />
            <Info label="School ID" value={result.studentProfile.studentIdNumber} />
            <Info
              label="Class"
              value={`${gradeLabel(result.studentProfile.gradeLevel)} · Section ${result.studentProfile.section} · ${result.studentProfile.academicYear}`}
            />
            <Info label="Parent" value={result.parent.name} />
            <Info
              label="Parent account"
              value={
                result.parentCreated
                  ? `Created. Temporary password: ${result.parentTemporaryPassword}`
                  : 'Reused existing parent login (same phone or email).'
              }
            />
            <Info
              label="Student login"
              value={
                result.studentLoginEnabled
                  ? `Enabled. Temporary password: ${result.studentTemporaryPassword}`
                  : 'Skipped (KG–G4 use the parent portal only).'
              }
            />
            <Info label="Portal access" value="Locked until tuition is verified" />
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
              Admit another student
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
      <PageHeader
        title="Admit student"
        subtitle="One parent login can cover several children. KG–G4: parent portal only."
      />
      <Card>
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={onSubmit}>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-slate-900">Student</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.studentName}
                onChange={(v) => set('studentName', v)}
                required
              />
              <Field
                label="Grade"
                placeholder="KG / 1–8 / Prep"
                value={form.grade}
                onChange={(v) => set('grade', v)}
                required
              />
              <Field
                label="Section"
                placeholder="A"
                value={form.section}
                onChange={(v) => set('section', v)}
                required
              />
              <Field
                label="Academic year"
                placeholder="2026-27"
                value={form.academicYear}
                onChange={(v) => set('academicYear', v)}
                required
              />
            </div>
          </fieldset>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium text-slate-900">Parent / guardian</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.parentName}
                onChange={(v) => set('parentName', v)}
                required
              />
              <Field
                label="Phone"
                placeholder="Required"
                value={form.parentPhone}
                onChange={(v) => set('parentPhone', v)}
                required
              />
              <Field
                label="Email"
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
              {busy ? 'Saving…' : 'Save admission'}
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
