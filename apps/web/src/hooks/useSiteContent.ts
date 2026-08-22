import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_SITE_CONTENT, type ISiteContent } from '@dt-academy/types';
import { api } from '../services/api';

export function useSiteContent() {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data } = await api.get<ISiteContent>('/site-content');
      return data;
    },
    placeholderData: DEFAULT_SITE_CONTENT,
  });
}

export function useUpdateSiteContent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: ISiteContent) => {
      const { data } = await api.put<ISiteContent>('/site-content', body);
      return data;
    },
    onSuccess: (data) => {
      client.setQueryData(['site-content'], data);
    },
  });
}
