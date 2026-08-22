import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { PaymentMethod } from '@dt-academy/types';
import { Button } from '@/components/ui/button';
import { useFamilyChildren } from '../hooks/useFamily';
import { useCreateOutstandingPayment, useMockCompletePayment, usePaymentStatus } from '../hooks/usePayments';
import { gradeLabel } from '../lib/labels';

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
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { data: children = [], isLoading } = useFamilyChildren();
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
        setError('Could not start this payment.');
      }
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-sm text-stone-500">Loading…</p>
      </div>
    );
  }

  if (!children.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="border border-stone-300 bg-white px-6 py-12 text-center">
          <p className="font-serif text-2xl text-stone-900">No student to pay for</p>
          <p className="mt-2 text-sm text-stone-500">Ask the office to admit your child first.</p>
        </div>
      </div>
    );
  }

  if (done === 'office') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <div className="border border-stone-300 bg-white p-10 text-center">
          <p className="font-serif text-2xl text-stone-900">Receipt submitted</p>
          <p className="mt-2 text-sm text-stone-500">
            The office will match this receipt number. Tuition stays pending until they confirm it.
          </p>
          <Button
            className="mt-6 rounded-full bg-teal-800 hover:bg-teal-900"
            type="button"
            onClick={() => navigate('/portal/dashboard')}
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Link to="/portal/dashboard" className="text-sm font-medium text-teal-800 hover:underline">
        Back to dashboard
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">Tuition</p>
      <h1 className="mt-2 font-serif text-4xl text-stone-900">Pay what is due</h1>
      <p className="mt-3 text-sm text-stone-500">
        Cash and bank stay with the office. Telebirr and M-Pesa go through the test payment page. This site never
        marks a month paid on its own.
      </p>

      <form className="mt-8 space-y-4 border border-stone-300 bg-white p-6" onSubmit={onSubmit}>
        <label className="block text-sm">
          <span className="font-medium text-stone-700">Child</span>
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
              <p className="font-semibold">Total: {total.toLocaleString()} ETB</p>
              <ul className="mt-2 space-y-1 text-xs text-stone-600">
                {unpaid.map((row) => (
                  <li key={row.month}>
                    {row.label}: {row.baseEtb.toLocaleString()}
                    {row.penaltyEtb > 0 ? ` + ${row.penaltyEtb.toLocaleString()} late` : ''} ETB
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>Nothing is outstanding.</p>
          )}
        </div>
        <label className="block text-sm">
          <span className="font-medium text-stone-700">Method</span>
          <select
            className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-700"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}
          >
            <option value="CASH">Cash at office</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="TELEBIRR">Telebirr</option>
            <option value="MPESA">M-Pesa</option>
          </select>
        </label>
        {office ? (
          <label className="block text-sm">
            <span className="font-medium text-stone-700">Receipt number</span>
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
            <span className="font-medium text-stone-700">M-Pesa phone</span>
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
          {create.isPending ? 'Starting…' : `Pay ${total.toLocaleString()} ETB`}
        </Button>
      </form>
    </div>
  );
}

function PayReturn({ paymentId, mock }: { paymentId: string; mock: boolean }) {
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
        setError('Could not complete the test payment.');
      }
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Link to="/portal/dashboard" className="text-sm font-medium text-teal-800 hover:underline">
        Back to dashboard
      </Link>
      <div className="mt-6 border border-stone-300 bg-white p-10 text-center">
        {isLoading ? (
          <p className="text-sm text-stone-500">Checking payment…</p>
        ) : status === 'VERIFIED' ? (
          <>
            <p className="font-serif text-2xl text-stone-900">Paid</p>
            <p className="mt-2 text-sm text-stone-500">The office does not need to stamp this receipt.</p>
          </>
        ) : status === 'REJECTED' ? (
          <>
            <p className="font-serif text-2xl text-stone-900">Not completed</p>
            <p className="mt-2 text-sm text-stone-500">The provider did not confirm this payment. Try again from Pay.</p>
          </>
        ) : (
          <>
            <p className="font-serif text-2xl text-stone-900">Waiting for confirmation</p>
            <p className="mt-2 text-sm text-stone-500">
              {data?.payment.method === 'MPESA'
                ? 'Approve the prompt on the phone. This page updates when the sandbox callback arrives.'
                : 'Finish on the Telebirr page. This page updates when the sandbox notifies the school.'}
            </p>
            {isMock ? (
              <Button
                className="mt-6 rounded-full bg-teal-800 hover:bg-teal-900"
                type="button"
                disabled={complete.isPending}
                onClick={() => void onMockPay()}
              >
                {complete.isPending ? 'Completing…' : 'Complete test payment'}
              </Button>
            ) : null}
          </>
        )}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
