import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IGradeSheetDetail, IGradeSheetQueueItem } from '@dt-academy/types';
import { api } from '../services/api';

export function useGradeSheet(courseId: string | undefined, term: number) {
  return useQuery({
    queryKey: ['grade-sheet', courseId, term],
    enabled: Boolean(courseId) && term >= 1 && term <= 3,
    queryFn: async () => {
      const { data } = await api.get<{ sheet: IGradeSheetDetail }>(`/grades/courses/${courseId}`, {
        params: { term },
      });
      return data.sheet;
    },
  });
}

export function useSaveGradeSheet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: { id: string; rows: IGradeSheetDetail['rows'] }) => {
      const { data } = await api.put<{ sheet: IGradeSheetDetail }>(`/grades/sheets/${body.id}/results`, {
        rows: body.rows,
      });
      return data.sheet;
    },
    onSuccess: (sheet) => {
      client.setQueryData(['grade-sheet', sheet.courseId, sheet.term], sheet);
    },
  });
}

export function useSubmitGradeSheet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ sheet: IGradeSheetDetail }>(`/grades/sheets/${id}/submit`);
      return data.sheet;
    },
    onSuccess: (sheet) => {
      client.setQueryData(['grade-sheet', sheet.courseId, sheet.term], sheet);
      void client.invalidateQueries({ queryKey: ['grade-queue'] });
    },
  });
}

export function useInquireSheet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: { id: string; reason: string }) => {
      const { data } = await api.post<{ sheet: IGradeSheetDetail }>(`/grades/sheets/${body.id}/inquire`, {
        reason: body.reason,
      });
      return data.sheet;
    },
    onSuccess: (sheet) => {
      client.setQueryData(['grade-sheet', sheet.courseId, sheet.term], sheet);
      void client.invalidateQueries({ queryKey: ['grade-queue'] });
    },
  });
}

export function useSheetQueue() {
  return useQuery({
    queryKey: ['grade-queue'],
    queryFn: async () => {
      const { data } = await api.get<{ queue: IGradeSheetQueueItem[] }>('/grades/queue');
      return data.queue;
    },
  });
}

export function useDirectorSheet(id: string | undefined) {
  return useQuery({
    queryKey: ['director-sheet', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get<{ sheet: IGradeSheetDetail }>(`/grades/sheets/${id}`);
      return data.sheet;
    },
  });
}

export function useApproveSheet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ sheet: IGradeSheetDetail }>(`/grades/sheets/${id}/approve`);
      return data.sheet;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['grade-queue'] });
      await client.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useReturnSheet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ sheet: IGradeSheetDetail }>(`/grades/sheets/${id}/return`);
      return data.sheet;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['grade-queue'] });
    },
  });
}

export function useResolveInquiry() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: { id: string; action: 'approve' | 'reject' }) => {
      const { data } = await api.post<{ sheet: IGradeSheetDetail }>(`/grades/inquiries/${body.id}/resolve`, {
        action: body.action,
      });
      return data.sheet;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['grade-queue'] });
      await client.invalidateQueries({ queryKey: ['director-sheet'] });
    },
  });
}
