import { useQuery } from '@tanstack/react-query';
import type { IFamilyChild, IPortalAnnouncement } from '@dt-academy/types';
import { api } from '../services/api';

export function useFamilyChildren() {
  return useQuery({
    queryKey: ['family-children'],
    queryFn: async () => {
      const { data } = await api.get<{ children: IFamilyChild[]; announcements: IPortalAnnouncement[] }>(
        '/family/children'
      );
      return data;
    },
  });
}

export function useStudentPortal() {
  return useQuery({
    queryKey: ['family-me'],
    queryFn: async () => {
      const { data } = await api.get<{ child: IFamilyChild; announcements: IPortalAnnouncement[] }>('/family/me');
      return data;
    },
  });
}
