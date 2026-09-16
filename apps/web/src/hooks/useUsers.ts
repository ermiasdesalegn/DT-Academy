import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IListedUser, IPersonHistory } from '@dt-academy/types';
import { api } from '../services/api';

export type PeopleGroup = 'all' | 'students' | 'parents' | 'staff' | 'former-students' | 'former-teachers';

export type UseUsersOptions = {
  group?: PeopleGroup;
  q?: string;
  take?: number;
  skip?: number;
  enabled?: boolean;
};

export function useUsers(groupOrOpts?: PeopleGroup | UseUsersOptions) {
  const opts: UseUsersOptions =
    typeof groupOrOpts === 'string' || groupOrOpts === undefined
      ? { group: groupOrOpts }
      : groupOrOpts;
  const group = opts.group ?? 'all';
  const q = opts.q?.trim() ?? '';
  const take = opts.take ?? 50;
  const skip = opts.skip ?? 0;

  return useQuery({
    queryKey: ['users', group, q, take, skip],
    enabled: opts.enabled !== false,
    queryFn: async () => {
      const { data } = await api.get<{ users: IListedUser[]; total: number }>('/users', {
        params: {
          ...(group !== 'all' ? { group } : {}),
          ...(q ? { q } : {}),
          take,
          skip,
        },
      });
      return { users: data.users, total: data.total ?? data.users.length };
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
