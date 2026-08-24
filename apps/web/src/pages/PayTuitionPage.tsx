import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { PaymentMethod } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { PageLoader } from '../components/layouts/PageLoader';
import { useFamilyChildren } from '../hooks/useFamily';
import { useCreateOutstandingPayment, useMockCompletePayment, usePaymentStatus } from '../hooks/usePayments';
import { useT } from '../hooks/useT';
import { useFormat } from '../hooks/useFormat';
import { gradeLabel, methodLabel } from '../lib/labels';

const OFFICE: PaymentMethod[] = ['CASH', 'BANK_TRANSFER'];

export function PayTuitionPage() {
  const [params] = useSearchParams();
  const returnId = params.get('payment');
  if (returnId) {
    return <PayReturn paymentId={returnId} mock={params.get('mock') === '1'} />;
  }
  return <PayForm />;
}

function PayForm() {
  const t = useT();
  const { n, month } = useFormat();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data, isLoading } = useFamilyChildren();
  const children = data?.children ?? [];
  const create = useCreateOutstandingPayment();
  const [error, setError] = useState('');
  const [done, setDone] = useState<'office' | null>(null);
  const first = children[0];
  const [form, setForm] = useState({
    studentProfileId: params.get('student') ?? '',
    method: 'CASH' as PaymentMethod,
    referencePNR: '',
    payerPhone: '',
  });

  const selectedId = form.studentProfileId || first?.profile._id || '';
  const selected = children.find((c) => c.profile._id === selectedId) ?? first;
  const unpaid = (selected?.tuitionMonths ?? []).filter((m) => m.status === 'UNPAID');
  const total = unpaid.reduce((sum, m) => sum + m.totalDueEtb, 0);
  const office = OFFICE.includes(form.method);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError('');
    try {
      const result = await create.mutateAsync({
        studentProfileId: selected.profile._id,
        method: form.method,
        referencePNR: office ? form.referencePNR : undefined,
        payerPhone: form.method === 'MPESA' ? form.payerPhone : undefined,
      });
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      if (result.waitingForPhone && result.payment?._id) {
        navigate(`/portal/pay/return?payment=${result.payment._id}`);
        return;
      }
      setDone('office');
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setError(err.response.data.message);
      } else {
        setError(t('pay.errStart'));
      }
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <PageLoader label={t('portal.loadTuition')} variant="portal" />
      </div>
    );
  }

  if (!children.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="border border-stone-300 bg-white px-6 py-12 text-center">
          <p className="font-serif text-2xl text-stone-900">{t('pay.noStudent')}</p>
          <p className="mt-2 text-sm text-stone-500">{t('pay.noStudentHint')}</p>
        </div>
      </div>
    );
  }

  if (done === 'office') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="border border-stone-300 bg-white p-10 text-center">
          <p className="font-serif text-2xl text-stone-900">{t('pay.receiptSubmitted')}</p>
          <p className="mt-2 text-sm text-stone-500">
            {t('pay.receiptHint')}
          </p>
          <Button
            className="mt-6 rounded-full bg-teal-800 hover:bg-teal-900"
            type="button"
            onClick={() => navigate('/portal/dashboard')}
          >
            {t('pay.backDash')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Link to="/portal/dashboard" className="text-sm font-medium text-teal-800 hover:underline">
        {t('pay.backDash')}
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">{t('portal.tuition')}</p>
      <h1 className="mt-2 font-serif text-4xl text-stone-900">{t('pay.title')}</h1>
      <p className="mt-3 text-sm text-stone-500">
        {t('pay.intro')}
      </p>

      <form className="mt-8 space-y-4 border border-stone-300 bg-white p-6" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="font-medium text-stone-700">{t('pay.child')}</span>
          <select
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-700"
            value={selectedId}
            onChange={(e) => setForm({ ...form, studentProfileId: e.target.value })}
          >
            {children.map((c) => (
              <option key={c.profile._id} value={c.profile._id}>
                {c.name} · {gradeLabel(c.profile.gradeLevel)} {c.profile.section}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
          {unpaid.length ? (
            <>
              <p className="font-semibold">{t('pay.total', { amount: total })}</p>
              <ul className="mt-2 space-y-1 text-xs text-stone-600">
                {unpaid.map((row) => (
                  <li key={row.month}>
                    {month(row.month)}: {n(row.baseEtb)}
                    {row.penaltyEtb > 0 ? ` ${t('portal.lateAdd', { amount: row.penaltyEtb })}` : ''} ETB
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>{t('pay.nothingDue')}</p>
          )}
        </div>
        <label className="block text-sm">
          <span className="font-medium text-stone-700">{t('pay.method')}</span>
          <select
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-700"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
          >
            <option value="CASH">{methodLabel('CASH')}</option>
            <option value="BANK_TRANSFER">{methodLabel('BANK_TRANSFER')}</option>
            <option value="TELEBIRR">{methodLabel('TELEBIRR')}</option>
            <option value="MPESA">{methodLabel('MPESA')}</option>
          </select>
        </label>
        {office ? (
          <label className="block text-sm">
            <span className="font-medium text-stone-700">{t('pay.receiptNo')}</span>
            <input
              required
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-700"
              value={form.referencePNR}
              onChange={(e) => setForm({ ...form, referencePNR: e.target.value })}
            />
          </label>
        ) : null}
        {form.method === 'MPESA' ? (
          <label className="block text-sm">
            <span className="font-medium text-stone-700">{t('pay.mpesaPhone')}</span>
            <input
              required
              placeholder="2517…"
              className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-teal-700"
              value={form.payerPhone}
              onChange={(e) => setForm({ ...form, payerPhone: e.target.value })}
            />
          </label>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button
          className="w-full rounded-full bg-teal-800 hover:bg-teal-900"
          type="submit"
          disabled={create.isPending || !unpaid.length}
        >
          {create.isPending ? t('pay.starting') : t('pay.payEtb', { amount: total })}
        </Button>
      </form>
    </div>
  );
}

function PayReturn({ paymentId, mock }: { paymentId: string; mock: boolean }) {
  const t = useT();
  const complete = useMockCompletePayment();
  const [error, setError] = useState('');
  const { data, isLoading } = usePaymentStatus(paymentId, true);
  const status = data?.payment.status;
  const isMock = mock || data?.mode === 'mock';

  async function onMockPay() {
    setError('');
    try {
      await complete.mutateAsync(paymentId);
    } catch (err) {
      if (axios.isAxiosError(err) && typeof err.response?.data?.message === 'string') {
        setError(err.response.data.message);
      } else {
        setError(t('pay.errTest'));
      }
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Link to="/portal/dashboard" className="text-sm font-medium text-teal-800 hover:underline">
        {t('pay.backDash')}
      </Link>
      <div className="mt-6 border border-stone-300 bg-white p-10 text-center">
        {isLoading ? (
          <p className="text-sm text-stone-500">{t('pay.checking')}</p>
        ) : status === 'VERIFIED' ? (
          <>
            <p className="font-serif text-2xl text-stone-900">{t('pay.paid')}</p>
            <p className="mt-2 text-sm text-stone-500">{t('pay.paidHint')}</p>
          </>
        ) : status === 'REJECTED' ? (
          <>
            <p className="font-serif text-2xl text-stone-900">{t('pay.notCompleted')}</p>
            <p className="mt-2 text-sm text-stone-500">{t('pay.notCompletedHint')}</p>
          </>
        ) : (
          <>
            <p className="font-serif text-2xl text-stone-900">{t('pay.waiting')}</p>
            <p className="mt-2 text-sm text-stone-500">
              {data?.payment.method === 'MPESA' ? t('pay.waitingMpesa') : t('pay.waitingTelebirr')}
            </p>
            {isMock ? (
              <Button
                className="mt-6 rounded-full bg-teal-800 hover:bg-teal-900"
                type="button"
                disabled={complete.isPending}
                onClick={() => void onMockPay()}
              >
                {complete.isPending ? t('pay.completing') : t('pay.completeTest')}
              </Button>
            ) : null}
          </>
        )}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
