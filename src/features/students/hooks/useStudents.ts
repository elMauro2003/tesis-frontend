import { useQuery } from '@tanstack/react-query';
import { studentService, GetStudentsFilters } from '@/core/services/student.service';

export function useStudents(filters: GetStudentsFilters = {}) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentService.getStudents(filters),
    /* A proper stale time configuration */
    staleTime: 5 * 60 * 1000, 
  });
}
