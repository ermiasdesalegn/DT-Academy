import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IPost, ICreatePostRequest, PostKind } from '@dt-academy/types';
import { api } from '../services/api';

export function usePosts(kind?: PostKind) {
  return useQuery({
    queryKey: ['posts', kind],
    queryFn: async () => {
      const { data } = await api.get<IPost[]>('/posts', { params: { kind } });
      return data;
    },
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: async () => {
      const { data } = await api.get<IPost>(`/posts/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ICreatePostRequest) => {
      const { data } = await api.post<IPost>('/posts', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
