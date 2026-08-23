import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { IListedUser, PaymentMethod, UserRole } from '@dt-academy/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreatePayment } from '../hooks/usePayments';
import { PageLoader } from '../components/layouts/PageLoader';
import { useUsers } from '../hooks/useUsers';
import { gradeLabel } from '../lib/labels';
import { api } from '../services/api';

type PeopleGroup = 'all' | 'students' | 'parents' | 'staff';

const STAFF_ROLES: UserRole[] = ['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'TEACHER'];

export function AdminDashboard() {
  const [group, setGroup] = useState<PeopleGroup>('all');
  const { data: users = [], isLoading, error } = useUsers(group);
  const [staffOpen, setStaffOpen] = useState(false);
  const [payStudent, setPayStudent] = useState<IListedUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<IListedUser | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">People</h1>
          <p className="mt-1 text-sm text-slate-500">
            Staff, parents, and students on file. Record tuition against a student to unlock access.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/admissions">Admit student</Link>
          </Button>
          <Button type="button" onClick={() => setStaffOpen(true)}>
            Add staff
          </Button>
        </div>
      </div>

      <Tabs value={group} onValueChange={(v) => setGroup(v as PeopleGroup)} className="mt-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="parents">Parents</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
      </Tabs>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white">
        {isLoading ? (
          <PageLoader label="Loading people" />
        ) : error ? (
          <p className="px-6 py-10 text-sm text-red-600">Could not load people. Check that the API is running.</p>
        ) : users.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-500">No accounts in this list yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((user) => (
              <li key={user._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">
                    {user.email}
                    {user.studentProfile
                      ? ` · ${user.studentProfile.studentIdNumber} · ${gradeLabel(user.studentProfile.gradeLevel)} · Section ${user.studentProfile.section}`
                      : null}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline">{roleLabel(user.role)}</Badge>
                  {user.role === 'PARENT' || user.role === 'TEACHER' ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPasswordUser(user)}>
                      Set password
                    </Button>
                  ) : null}
                  {user.studentProfile ? (
                    <>
                      <Badge
                        className={
                          user.studentProfile.isActive
                            ? 'border-0 bg-emerald-100 font-medium text-emerald-800 hover:bg-emerald-100'
                            : 'border-0 bg-amber-100 font-medium text-amber-800 hover:bg-amber-100'
                        }
                      >
                        {user.studentProfile.isActive ? 'Active & Paid' : 'Locked'}
                      </Badge>
                      <Button type="button" variant="outline" size="sm" onClick={() => setPayStudent(user)}>
                        Record payment
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddStaffDialog open={staffOpen} onOpenChange={setStaffOpen} />
      <RecordPaymentDialog student={payStudent} onOpenChange={(open) => !open && setPayStudent(null)} />
      <SetPasswordDialog user={passwordUser} onOpenChange={(open) => !open && setPasswordUser(null)} />
    </div>
  );
}

function roleLabel(role: UserRole): string {
  if (role === 'IT_ADMIN') return 'IT Admin';
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function AddStaffDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'TEACHER' as UserRole, phone: '' });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['insights'] });
      onOpenChange(false);
      setForm({ name: '', email: '', password: '', role: 'TEACHER', phone: '' });
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setError(err.response.data.message);
      } else {
        setError('Could not create this staff account.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-gray-200 shadow-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add staff</DialogTitle>
          <DialogDescription>Teachers and office accounts. Families are created through Admissions.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Full name</span>
            <input
              required
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Temporary password</span>
            <input
              required
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Role</span>
            <select
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Create account'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RecordPaymentDialog({
  student,
  onOpenChange,
}: {
  student: IListedUser | null;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreatePayment();
  const profile = student?.studentProfile;
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    amount: '',
    method: 'CASH' as PaymentMethod,
    referencePNR: '',
    academicYear: '',
    term: '1',
    month: String(new Date().getMonth() + 1),
  });

  useEffect(() => {
    setForm({
      amount: '',
      method: 'CASH',
      referencePNR: '',
      academicYear: profile?.academicYear ?? '',
      term: '1',
      month: String(new Date().getMonth() + 1),
    });
    setError('');
  }, [profile]);

  const year = form.academicYear || profile?.academicYear || '';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError('');
    try {
      await create.mutateAsync({
        studentProfileId: profile._id,
        amount: Number(form.amount),
        method: form.method,
        referencePNR: form.referencePNR,
        academicYear: year,
        term: Number(form.term),
        month: Number(form.month),
      });
      onOpenChange(false);
      setForm({ amount: '', method: 'CASH', referencePNR: '', academicYear: '', term: '1', month: String(new Date().getMonth() + 1) });
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setError(err.response.data.message);
      } else {
        setError('Could not record this payment.');
      }
    }
  }

  return (
    <Dialog open={Boolean(student)} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-gray-200 shadow-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {student
              ? `${student.name}. Cash at office or bank slip. Status starts as pending until verified on Overview.`
              : ''}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Amount (ETB)</span>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Method</span>
            <select
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
            >
              <option value="CASH">Cash at office</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="TELEBIRR">Telebirr</option>
              <option value="MPESA">M-Pesa</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-slate-700">Receipt number</span>
            <input
              required
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={form.referencePNR}
              onChange={(e) => setForm({ ...form, referencePNR: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              <span className="font-medium text-slate-700">Academic year</span>
              <input
                required
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={year}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">Month</span>
              <select
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              >
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((name, i) => (
                  <option key={name} value={String(i + 1)}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">Term</span>
              <select
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </label>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Saving…' : 'Save as pending'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SetPasswordDialog({
  user,
  onOpenChange,
}: {
  user: IListedUser | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPassword('');
    setError('');
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError('');
    setBusy(true);
    try {
      await api.post(`/users/${user._id}/password`, { password });
      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setError(err.response.data.message);
      } else {
        setError('Could not update this password.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-gray-200 shadow-none sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set password</DialogTitle>
          <DialogDescription>
            {user ? `Give ${user.name} a new login password. Tell them in person — it is not emailed.` : ''}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label className="text-sm">
            <span className="font-medium text-slate-700">New password</span>
            <input
              required
              minLength={8}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
