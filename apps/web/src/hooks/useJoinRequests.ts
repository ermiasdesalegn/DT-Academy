import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IJoinRequest, ISubmitJoinRequest } from '@dt-academy/types';
import { api } from '../services/api';

export function useJoinRequests(status: 'PENDING' | 'ALL' | 'APPROVED' | 'REJECTED' = 'PENDING') {
  return useQuery({
    queryKey: ['join-requests', status],
    queryFn: async () => {
      const { data } = await api.get<{ requests: IJoinRequest[] }>('/join-requests', {
        params: { status },
      });
      return data.requests;
    },
  });
}

export function useApproveJoinRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      section?: string;
      academicYear?: string;
      enableStudentLogin?: boolean;
    }) => {
      const { data } = await api.post(`/join-requests/${input.id}/approve`, {
        section: input.section,
        academicYear: input.academicYear,
        enableStudentLogin: input.enableStudentLogin,
      });
      return data;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['join-requests'] });
      await client.invalidateQueries({ queryKey: ['classes'] });
      await client.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useRejectJoinRequest() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; reason?: string }) => {
      const { data } = await api.post<{ request: IJoinRequest }>(`/join-requests/${input.id}/reject`, {
        reason: input.reason,
      });
      return data.request;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['join-requests'] });
    },
  });
}

export async function submitJoinRequest(body: ISubmitJoinRequest) {
  const { data } = await api.post<{ request: IJoinRequest }>('/join-requests', body);
  return data.request;
}
