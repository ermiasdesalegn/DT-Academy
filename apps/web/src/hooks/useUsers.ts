import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IListedUser, IPersonHistory } from '@dt-academy/types';
import { api } from '../services/api';

export type PeopleGroup = 'all' | 'students' | 'parents' | 'staff' | 'former-students' | 'former-teachers';

export function useUsers(group?: PeopleGroup) {
  return useQuery({
    queryKey: ['users', group ?? 'all'],
    queryFn: async () => {
      const params = group && group !== 'all' ? { group } : undefined;
      const { data } = await api.get<{ users: IListedUser[] }>('/users', { params });
      return data.users;
    },
  });
}

export function usePersonHistory(id: string | undefined) {
  return useQuery({
    queryKey: ['user-history', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<IPersonHistory>(`/users/${id}/history`);
      return data;
    },
  });
}

export function useMarkFormer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.post<{ user: IListedUser }>(`/users/${id}/mark-former`, { reason });
      return data.user;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] });
      await qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useRestoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ user: IListedUser }>(`/users/${id}/restore`);
      return data.user;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['users'] });
      await qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}
