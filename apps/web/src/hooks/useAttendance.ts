import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AttendanceStatus, IAttendanceDay } from '@dt-academy/types';
import { api } from '../services/api';

export function useAttendanceDay(courseId: string | undefined, date: string) {
  return useQuery({
    queryKey: ['attendance', courseId, date],
    enabled: Boolean(courseId) && Boolean(date),
    queryFn: async () => {
      const { data } = await api.get<IAttendanceDay>('/attendance', { params: { courseId, date } });
      return data;
    },
  });
}

export function useSaveAttendance() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      courseId: string;
      date: string;
      marks: { studentId: string; status: AttendanceStatus }[];
    }) => {
      const { data } = await api.put<IAttendanceDay>('/attendance', body);
      return data;
    },
    onSuccess: (day) => {
      client.setQueryData(['attendance', day.courseId, day.date], day);
    },
  });
}
