import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IClassGroup, IClassOverall } from '@dt-academy/types';
import { api } from '../services/api';

export function useClasses() {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await api.get<{ classes: IClassGroup[] }>('/classes');
      return data.classes;
    },
  });
}

export function useClassOverall(params: {
  gradeLevel?: number;
  section?: string;
  academicYear?: string;
  enabled?: boolean;
}) {
  const enabled =
    params.enabled !== false &&
    params.gradeLevel != null &&
    Boolean(params.section) &&
    Boolean(params.academicYear);
  return useQuery({
    queryKey: ['class-overall', params.gradeLevel, params.section, params.academicYear],
    enabled,
    queryFn: async () => {
      const { data } = await api.get<{ overall: IClassOverall }>('/classes/overall', {
        params: {
          gradeLevel: params.gradeLevel,
          section: params.section,
          academicYear: params.academicYear,
        },
      });
      return data.overall;
    },
  });
}

export function useSetHomeroom() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      gradeLevel: number;
      section: string;
      academicYear: string;
      teacherId: string;
    }) => {
      const { data } = await api.put('/classes/homeroom', body);
      return data;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['classes'] });
      await client.invalidateQueries({ queryKey: ['class-overall'] });
    },
  });
}

export function useTeachingHome() {
  return useQuery({
    queryKey: ['teaching-me'],
    queryFn: async () => {
      const { data } = await api.get<{
        homerooms: { gradeLevel: number; section: string; academicYear: string }[];
        courses: { _id: string; name: string; gradeLevel: number; section: string; academicYear: string }[];
        overall: IClassOverall | null;
      }>('/classes/teaching/me');
      return data;
    },
  });
}
