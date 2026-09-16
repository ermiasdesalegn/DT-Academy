import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICreateSchoolMemorialRequest, ISchoolMemorial } from '@dt-academy/types';
import { api } from '../services/api';

export function useMemorials(studentId?: string | null) {
  return useQuery({
    queryKey: ['memorials', studentId === undefined ? 'all' : studentId ?? 'none'],
    enabled: studentId !== null,
    queryFn: async () => {
      const { data } = await api.get<{ memorials: ISchoolMemorial[] }>('/memorials', {
        params: studentId ? { studentId } : undefined,
      });
      return data.memorials;
    },
  });
}

export function useCreateMemorial() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: ICreateSchoolMemorialRequest) => {
      const { data } = await api.post<{ memorial: ISchoolMemorial }>('/memorials', body);
      return data.memorial;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['memorials'] });
    },
  });
}

export function useUploadMemorialMedia() {
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('file', file);
      const { data } = await api.post<{ url: string }>('/memorials/upload', body);
      return data.url;
    },
  });
}

export function useDeleteMemorial() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/memorials/${id}`);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['memorials'] });
    },
  });
}
