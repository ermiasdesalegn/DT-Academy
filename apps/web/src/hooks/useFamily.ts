import { useQuery } from '@tanstack/react-query';
import type { IFamilyChild } from '@dt-academy/types';
import { api } from '../services/api';

export function useFamilyChildren() {
  return useQuery({
    queryKey: ['family-children'],
    queryFn: async () => {
      const { data } = await api.get<{ children: IFamilyChild[] }>('/family/children');
      return data.children;
    },
  });
}
