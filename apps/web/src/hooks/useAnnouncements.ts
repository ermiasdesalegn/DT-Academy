import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AnnouncementAudience, IPortalAnnouncement } from '@dt-academy/types';
import { api } from '../services/api';

export type ListedAnnouncement = IPortalAnnouncement & { authorName?: string };

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await api.get<{ announcements: ListedAnnouncement[] }>('/announcements');
      return data.announcements;
    },
  });
}

export function useCreateAnnouncement() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      title: string;
      content: string;
      audience: AnnouncementAudience;
      gradeLevel?: number | '';
    }) => {
      const { data } = await api.post('/announcements', body);
      return data;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
