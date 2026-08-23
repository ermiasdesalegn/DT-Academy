import { useQuery } from '@tanstack/react-query';
import type { IInsights } from '@dt-academy/types';
import { api } from '../services/api';

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const { data } = await api.get<IInsights>('/insights');
      return data;
    },
  });
}
