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
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreatePayment } from '../hooks/usePayments';
import { PageLoader } from '../components/layouts/PageLoader';
import { EmptyState } from '../components/layouts/Page';
import { useMarkFormer, useRestoreUser, useUsers, type PeopleGroup } from '../hooks/useUsers';
import { useT } from '../hooks/useT';
import { gradeLabel } from '../lib/labels';
import { api } from '../services/api';

const STAFF_ROLES: UserRole[] = ['DIRECTOR', 'IT_ADMIN', 'MANAGER', 'TEACHER'];

export function AdminDashboard() {
  const t = useT();
  const [group, setGroup] = useState<PeopleGroup>('all');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const { data, isLoading, error } = useUsers({ group, q, take: 50 });
  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const markFormer = useMarkFormer();
  const restore = useRestoreUser();
  const [staffOpen, setStaffOpen] = useState(false);
  const [payStudent, setPayStudent] = useState<IListedUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<IListedUser | null>(null);
  const [formerTarget, setFormerTarget] = useState<IListedUser | null>(null);
  const [formerReason, setFormerReason] = useState('');
  const [actionError, setActionError] = useState('');
  const isFormerTab = group === 'former-students' || group === 'former-teachers';

  async function confirmMarkFormer() {
    if (!formerTarget) return;
    setActionError('');
    try {
      await markFormer.mutateAsync({ id: formerTarget._id, reason: formerReason || undefined });
      setFormerTarget(null);
      setFormerReason('');
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setActionError(err.response.data.message);
      } else {
        setActionError(t('office.formerActionError'));
      }
    }
  }

  async function onRestore(user: IListedUser) {
    setActionError('');
    try {
      await restore.mutateAsync(user._id);
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setActionError(err.response.data.message);
      } else {
        setActionError(t('office.formerActionError'));
      }
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('office.peopleTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('office.peopleHint')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/admissions">{t('office.admitStudent')}</Link>
          </Button>
          <Button type="button" onClick={() => setStaffOpen(true)}>
            {t('office.addStaff')}
          </Button>
        </div>
      </div>

      <Tabs value={group} onValueChange={(v) => setGroup(v as PeopleGroup)} className="mt-6">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="all">{t('office.tabAll')}</TabsTrigger>
          <TabsTrigger value="students">{t('office.tabStudents')}</TabsTrigger>
          <TabsTrigger value="parents">{t('office.tabParents')}</TabsTrigger>
          <TabsTrigger value="staff">{t('office.tabStaff')}</TabsTrigger>
          <TabsTrigger value="former-students">{t('office.tabFormerStudents')}</TabsTrigger>
          <TabsTrigger value="former-teachers">{t('office.tabFormerTeachers')}</TabsTrigger>
        </TabsList>
      </Tabs>

      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQ(search.trim());
        }}
      >
        <Input
          className="max-w-sm"
          placeholder={t('office.peopleSearch')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="outline">
          {t('common.search')}
        </Button>
        {q ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearch('');
              setQ('');
            }}
          >
            {t('common.clear')}
          </Button>
        ) : null}
      </form>
      {!isLoading && users.length > 0 && total > users.length ? (
        <p className="mt-2 text-xs text-slate-500">{t('office.peopleShowing', { shown: users.length, total })}</p>
      ) : null}

      {actionError ? <p className="mt-3 text-sm text-red-600">{actionError}</p> : null}

      <section className="mt-4 rounded-lg border border-slate-200 bg-white">
        {isLoading ? (
          <PageLoader label={t('office.peopleLoading')} />
        ) : error ? (
          <p className="px-6 py-10 text-sm text-red-600">{t('office.peopleError')}</p>
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState title={t('office.peopleEmpty')} body={t('office.peopleEmptyHint')} />
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {users.map((user) => {
              const former = Boolean(user.leftAt || user.studentProfile?.isFormer);
              const canMarkFormer =
                !former && (user.role === 'STUDENT' || user.role === 'TEACHER') && !isFormerTab;
              return (
                <li key={user._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">
                      {user.email}
                      {user.studentProfile
                        ? ` · ${user.studentProfile.studentIdNumber} · ${gradeLabel(user.studentProfile.gradeLevel)} · Section ${user.studentProfile.section}`
                        : null}
                      {user.leftAt ? ` · ${t('office.leftOn')} ${new Date(user.leftAt).toLocaleDateString()}` : null}
                      {user.fatherName ? ` · Father: ${user.fatherName}` : null}
                    </p>
                    {user.leftReason ? <p className="mt-0.5 text-xs text-slate-400">{user.leftReason}</p> : null}
                    {user.siblings && user.siblings.length > 0 ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Siblings: {user.siblings.map(s => `${s.name} ${s.isFormer ? '(Former)' : ''}`).join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Badge variant="outline">{roleLabel(user.role)}</Badge>
                    {former ? (
                      <Badge className="border-0 bg-slate-100 font-medium text-slate-700 hover:bg-slate-100">
                        {t('office.formerBadge')}
                      </Badge>
                    ) : null}
                    {user.role === 'PARENT' || user.role === 'TEACHER' ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setPasswordUser(user)}>
                        {t('office.setPassword')}
                      </Button>
                    ) : null}
                    {user.studentProfile && !former ? (
                      <>
                        <Badge
                          className={
                            user.studentProfile.isActive
                              ? 'border-0 bg-emerald-100 font-medium text-emerald-800 hover:bg-emerald-100'
                              : 'border-0 bg-amber-100 font-medium text-amber-800 hover:bg-amber-100'
                          }
                        >
                          {user.studentProfile.isActive ? t('office.activePaid') : t('office.locked')}
                        </Badge>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPayStudent(user)}>
                          {t('office.recordPayment')}
                        </Button>
                      </>
                    ) : null}
                    {(user.role === 'STUDENT' || user.role === 'TEACHER') && (
                      <Button type="button" variant="outline" size="sm" asChild>
                        <Link to={`/admin/people/${user._id}/history`}>{t('office.viewHistory')}</Link>
                      </Button>
                    )}
                    {canMarkFormer ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFormerTarget(user)}>
                        {t('office.markFormer')}
                      </Button>
                    ) : null}
                    {former && (user.role === 'STUDENT' || user.role === 'TEACHER') ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={restore.isPending}
                        onClick={() => void onRestore(user)}
                      >
                        {t('office.restore')}
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AddStaffDialog open={staffOpen} onOpenChange={setStaffOpen} />
      <RecordPaymentDialog student={payStudent} onOpenChange={(open) => !open && setPayStudent(null)} />
      <SetPasswordDialog user={passwordUser} onOpenChange={(open) => !open && setPasswordUser(null)} />

      <Dialog
        open={Boolean(formerTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setFormerTarget(null);
            setFormerReason('');
            setActionError('');
          }
        }}
      >
        <DialogContent className="rounded-2xl border-gray-200 shadow-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('office.markFormer')}</DialogTitle>
            <DialogDescription>
              {formerTarget
                ? t('office.markFormerHint', { name: formerTarget.name })
                : ''}
            </DialogDescription>
          </DialogHeader>
          <label className="text-sm">
            <span className="font-medium text-slate-700">{t('office.formerReason')}</span>
            <input
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={formerReason}
              onChange={(e) => setFormerReason(e.target.value)}
              placeholder={t('office.formerReasonPh')}
            />
          </label>
          {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
          <Button type="button" disabled={markFormer.isPending} onClick={() => void confirmMarkFormer()}>
            {markFormer.isPending ? t('office.saving') : t('office.confirmFormer')}
          </Button>
        </DialogContent>
      </Dialog>
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
