import { useQuery } from '@tanstack/react-query';
import type { IListedUser } from '@dt-academy/types';
import { api } from '../services/api';

export function useUsers(group?: 'all' | 'students' | 'parents' | 'staff') {
  return useQuery({
    queryKey: ['users', group ?? 'all'],
    queryFn: async () => {
      const params = group && group !== 'all' ? { group } : undefined;
      const { data } = await api.get<{ users: IListedUser[] }>('/users', { params });
      return data.users;
    },
  });
}
