import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICreatePaymentRequest, IPaymentListItem, PaymentMethod, PaymentStatus } from '@dt-academy/types';
import { api } from '../services/api';

async function invalidateOfficeAndFamily(client: ReturnType<typeof useQueryClient>) {
  await client.invalidateQueries({ queryKey: ['payments'] });
  await client.invalidateQueries({ queryKey: ['insights'] });
  await client.invalidateQueries({ queryKey: ['users'] });
  await client.invalidateQueries({ queryKey: ['family-children'] });
}

export function usePayments(status?: PaymentStatus) {
  return useQuery({
    queryKey: ['payments', status ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get<{ payments: IPaymentListItem[] }>('/payments', {
        params: status ? { status } : undefined,
      });
      return data.payments;
    },
  });
}

export function useCreatePayment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: ICreatePaymentRequest) => {
      const { data } = await api.post<{ payment: IPaymentListItem }>('/payments', body);
      return data.payment;
    },
    onSuccess: async () => {
      await invalidateOfficeAndFamily(client);
    },
  });
}

export function useCreateOutstandingPayment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      studentProfileId: string;
      method: PaymentMethod;
      referencePNR?: string;
      payerPhone?: string;
    }) => {
      const { data } = await api.post<{
        payment: IPaymentListItem;
        months: number[];
        amount: number;
        checkoutUrl?: string;
        waitingForPhone?: boolean;
      }>('/payments/outstanding', body);
      return data;
    },
    onSuccess: async () => {
      await invalidateOfficeAndFamily(client);
    },
  });
}

export function useStudentTuition(studentId: string | undefined) {
  return useQuery({
    queryKey: ['tuition', studentId],
    enabled: Boolean(studentId),
    queryFn: async () => {
      const { data } = await api.get<{
        studentName: string;
        studentIdNumber: string;
        academicYear: string;
        months: import('@dt-academy/types').ITuitionMonth[];
        logs: import('@dt-academy/types').IPaymentStatusLog[];
      }>(`/payments/student/${studentId}/tuition`);
      return data;
    },
  });
}

export function useSetTuitionMonth() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      studentProfileId: string;
      month: number;
      status: 'PAID' | 'UNPAID';
      note?: string;
    }) => {
      const { data } = await api.post('/payments/months', body);
      return data;
    },
    onSuccess: async (_data, vars) => {
      await invalidateOfficeAndFamily(client);
      await client.invalidateQueries({ queryKey: ['tuition', vars.studentProfileId] });
    },
  });
}

export function usePaymentStatus(paymentId: string | undefined, poll: boolean) {
  return useQuery({
    queryKey: ['payment-status', paymentId],
    enabled: Boolean(paymentId),
    refetchInterval: (query) => {
      const status = query.state.data?.payment.status;
      if (status === 'VERIFIED' || status === 'REJECTED') return false;
      return poll ? 2500 : false;
    },
    queryFn: async () => {
      const { data } = await api.get<{ payment: IPaymentListItem; mode: 'mock' | 'sandbox' }>(
        `/payments/${paymentId}/status`
      );
      return data;
    },
  });
}

export function useMockCompletePayment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data } = await api.post<{ ok: boolean; already?: boolean }>('/payments/mock/complete', { paymentId });
      return data;
    },
    onSuccess: async (_data, paymentId) => {
      await invalidateOfficeAndFamily(client);
      await client.invalidateQueries({ queryKey: ['payment-status', paymentId] });
    },
  });
}

export function useVerifyPayment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ payment: IPaymentListItem }>(`/payments/${id}/verify`);
      return data.payment;
    },
    onSuccess: async () => {
      await invalidateOfficeAndFamily(client);
    },
  });
}
