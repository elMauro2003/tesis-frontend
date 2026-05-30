import { useQuery } from '@tanstack/react-query';
import { studentService, ExtendedGetStudentsFilters } from '@/core/services/student.service';

export function useStudents(filters: ExtendedGetStudentsFilters = {}) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentService.getStudents(filters),
    staleTime: 5 * 60 * 1000,
  });
}
