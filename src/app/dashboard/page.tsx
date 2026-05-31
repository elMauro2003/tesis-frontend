"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from "@/store/useAuthStore";
import { ViewStudentPanel } from "@/features/students/components/ViewStudentPanel";
import { DeleteStudentModal } from "@/features/students/components/DeleteStudentModal";
import { EvaluateStudentModal } from "@/features/students/components/EvaluateStudentModal";
import { RoomAssignment, Student } from "@/types/models";
import { fetchClient } from '@/lib/fetchClient';
import { studentService } from '@/core/services/student.service';
import { accommodationService } from '@/core/services/accommodation.service';
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardFiltersBar } from "@/components/shared/DashboardFiltersBar";
import { DashboardFilterSelect } from "@/components/shared/DashboardFilterSelect";
import { DashboardSegmentedFilter } from "@/components/shared/DashboardSegmentedFilter";
import { SearchField } from "@/components/shared/SearchField";

type CareerOption = { id: number; name: string; faculty?: any };
type GroupOption = { id: number; name: string; career_year?: { career?: { id: number } } | number };

const getAssignmentStudentId = (assignment: RoomAssignment): number | null => {
  if (typeof assignment.student === 'number') return assignment.student;
  return assignment.student?.id ?? null;
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentToDeleteId, setSelectedStudentToDeleteId] = useState<number | null>(null);
  const [selectedStudentToEvaluateId, setSelectedStudentToEvaluateId] = useState<number | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Filters
  const [facultyId, setFacultyId] = useState<number | 'all'>('all');
  const [buildingId, setBuildingId] = useState<number | 'all'>('all');
  const [gender, setGender] = useState<'M' | 'F' | 'all'>('all');
  const [isMilitant, setIsMilitant] = useState<boolean | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'with_room' | 'without_room'>('all');

  const [careers, setCareers] = useState<CareerOption[]>([]);
  const [faculties, setFaculties] = useState<Array<{id:number;name:string}>>([]);
  const [buildings, setBuildings] = useState<Array<{id:number;name:string}>>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);

  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const PAGE_SIZE = 10;

  const activeAssignmentsQuery = useQuery({
    queryKey: ['active-assignments'],
    queryFn: () => accommodationService.getAllActiveAssignments(),
    enabled: locationFilter !== 'all',
    staleTime: 60 * 1000,
  });

  const assignedStudentIds = useMemo(() => {
    const ids = new Set<number>();
    activeAssignmentsQuery.data?.results.forEach((assignment) => {
      const studentId = getAssignmentStudentId(assignment);
      if (studentId !== null) ids.add(studentId);
    });
    return ids;
  }, [activeAssignmentsQuery.data]);

  const suggestionsQuery = useQuery({
    queryKey: ['student-suggestions', debouncedSearch],
    queryFn: () => studentService.getStudents({ search: debouncedSearch, page_size: 5 }),
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 30 * 1000,
  });

  const suggestions = suggestionsQuery.data?.results ?? [];

  const studentsQuery = useQuery({
    queryKey: [
      'students-all',
      debouncedSearch,
      facultyId,
      buildingId,
      gender,
      isMilitant,
    ],
    queryFn: () => studentService.getAllStudents({
      page_size: 100,
      search: debouncedSearch,
      // Faculty is filtered locally, building locally if no api support,
      gender: gender === 'all' ? undefined : gender,
      is_militant: isMilitant === 'all' ? undefined : isMilitant,
    }),
    staleTime: 60 * 1000,
  });

  const allStudents = studentsQuery.data?.results ?? [];
  // Helper to normalize student.group into a Group-like object from groups (if needed)
  const resolveStudentGroup = (student: Student) => {
    const grp = (student as any).group;
    if (!grp) return null;
    // already object with career_year
    if (typeof grp === 'object' && grp.career_year) return grp;
    // if group is numeric id
    if (typeof grp === 'number') return groups.find(g => g.id === grp) as any || null;
    // if group is string name, try to find by name
    if (typeof grp === 'string') return groups.find(g => g.name === grp) as any || null;
    return null;
  };

  const facultyFilteredStudents = useMemo(() => {
      if (facultyId === 'all') return allStudents;
      return allStudents.filter((student) => {
        const g = resolveStudentGroup(student);
        if (!g?.career_year) return false;
        let cId = null;
        if (typeof g.career_year.career === 'object' && g.career_year.career) {
          cId = g.career_year.career.id;
        } else if (typeof g.career_year.career === 'number') {
          cId = g.career_year.career;
        }
        if (cId === null) return false;
        const careerObj = careers.find(c => c.id === cId);
        const fId = careerObj ? careerObj.faculty : null;
        const actualFId = typeof fId === 'object' && fId !== null ? fId.id : fId;
        return actualFId === facultyId;
      });
    }, [allStudents, facultyId, careers, groups]);

    const buildingFilteredStudents = useMemo(() => {
      if (buildingId === 'all') return facultyFilteredStudents;
      return facultyFilteredStudents.filter((student) => {
         // handle paginated response or array
         const rawData = activeAssignmentsQuery.data;
         const assignments = Array.isArray(rawData) ? rawData : (rawData?.results || []);
         const assign = assignments.find((a: any) => getAssignmentStudentId(a) === student.id);
         if (!assign || !assign.room) return false;
         
         const roomObj = typeof assign.room === 'object' ? assign.room : null;
         if (roomObj && typeof roomObj.wing === 'object') {
             const b = typeof roomObj.wing.building === 'object' ? roomObj.wing.building.id : roomObj.wing.building;
             return b === buildingId;
         }
         return false;
      });
    }, [facultyFilteredStudents, buildingId, activeAssignmentsQuery.data]);

    const locationFilteredStudents = useMemo(() => {
      if (locationFilter === 'all') return buildingFilteredStudents;
      return buildingFilteredStudents.filter((student: any) => {
        const hasRoom = typeof student.has_room === 'boolean' 
             ? student.has_room 
             : assignedStudentIds.has(student.id);
        return locationFilter === 'with_room' ? hasRoom : !hasRoom;
      });
    }, [buildingFilteredStudents, assignedStudentIds, locationFilter]);

    const totalPages = Math.max(1, Math.ceil(locationFilteredStudents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedStudents = useMemo(
    () => locationFilteredStudents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [locationFilteredStudents, safePage]
  );

  // Fetch full student details for the currently visible rows to ensure all relations are loaded
  const visibleStudentIds = paginatedStudents.map(s => s.id);
  const visibleDetailsQuery = useQuery({
    queryKey: ['students-visible-details', visibleStudentIds, debouncedSearch, facultyId, buildingId, gender, isMilitant],
    queryFn: () => {
      if (visibleStudentIds.length === 0) return Promise.resolve([] as any);
      return studentService.getStudentsByIds(visibleStudentIds);
    },
    enabled: visibleStudentIds.length > 0,
    staleTime: 60 * 1000,
  });

  const visibleDetailsById = useMemo(() => {
    const map = new Map<number, any>();
    (visibleDetailsQuery.data || []).forEach((s: any) => map.set(s.id, s));
    return map;
  }, [visibleDetailsQuery.data]);

  const selectedStudentToDelete = useMemo(() => {
    if (!selectedStudentToDeleteId) return null;
    return (visibleDetailsById.get(selectedStudentToDeleteId) as Student | undefined)
      || paginatedStudents.find((student) => student.id === selectedStudentToDeleteId)
      || null;
  }, [selectedStudentToDeleteId, visibleDetailsById, paginatedStudents]);

  const selectedStudentToEvaluate = useMemo(() => {
    if (!selectedStudentToEvaluateId) return null;
    return (visibleDetailsById.get(selectedStudentToEvaluateId) as Student | undefined)
      || paginatedStudents.find((student) => student.id === selectedStudentToEvaluateId)
      || null;
  }, [selectedStudentToEvaluateId, visibleDetailsById, paginatedStudents]);

  // Enriched details: ensure career and faculty objects are present when only ids are returned
  const enrichedVisibleDetailsById = useMemo(() => {
    const map = new Map<number, any>();
    (visibleDetailsQuery.data || []).forEach((s: any) => {
      const copy = { ...s };
      try {
        const gd = copy.group_detail || copy.group || null;
        if (gd && gd.career_year_detail) {
          const cry = gd.career_year_detail;
          // career may be id or object
          if (typeof cry.career === 'number') {
            const careerObj = careers.find(c => c.id === cry.career);
            if (careerObj) cry.career = careerObj;
          }
          // if career now has faculty id, resolve to object from faculties
          if (cry.career && typeof cry.career === 'object' && (cry.career as any).faculty) {
            const facId = (cry.career as any).faculty;
            const facObj = faculties.find(f => f.id === facId);
            if (facObj) (cry.career as any).faculty = facObj;
          }
        }
      } catch (err) {
        // ignore enrichment errors
      }
      map.set(copy.id, copy);
    });
    return map;
  }, [visibleDetailsQuery.data, careers, faculties]);
  const isLoading = studentsQuery.isLoading || (locationFilter !== 'all' && activeAssignmentsQuery.isLoading);
  const isError = studentsQuery.isError || activeAssignmentsQuery.isError;
  const error = (studentsQuery.error || activeAssignmentsQuery.error) as Error | null;

  // For handling input with simple debounce
  const handleSearch = (value: string) => {
    setSearch(value);
  };
  
  // Fetch careers and groups for filters
  useEffect(() => {
    let mounted = true;
    fetchClient('/api/v1/carreras/')
      .then((res: any) => { if (!mounted) return; setCareers(res.results || res); })
      .catch(() => {})
    ;

    fetchClient('/api/v1/facultades/')
      .then((res: any) => { if (!mounted) return; setFaculties(res.results || res); })
      .catch(() => {})
    ;

    fetchClient('/api/v1/grupos/')
      .then((res: any) => { if (!mounted) return; setGroups(res.results || res); })
      .catch(() => {})
    ;

    fetchClient('/api/v1/edificios/')
      .then((res: any) => { if (!mounted) return; setBuildings(res.results || res); })
      .catch(() => {})
    ;

    return () => { mounted = false; };
  }, []);

  // Debounce search
  useEffect(() => {
    const deb = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(deb);
  }, [search]);

  // Reset page when server-side filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, facultyId, buildingId, gender, isMilitant, locationFilter]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);
  
  // keyboard navigation for suggestions
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setActiveSuggestion(-1);
      return;
    }

    if (suggestions.length === 0) {
      if (e.key === 'Enter') {
        setDebouncedSearch(search);
        setPage(1);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((s) => Math.min(s + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        const s = suggestions[activeSuggestion];
        setSelectedStudentId(s.id);
        setIsSearchFocused(false);
        setSearch('');
      } else {
        setDebouncedSearch(search);
        setPage(1);
      }
    }
  };

  return (
    <div className="w-full px-8 py-4">
      <DashboardPageHeader
        title="Estudiantes"
        description="Lista y administra estudiantes activos y sus asignaciones dentro del sistema." 
        topBadge="Personas"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar estudiante por nombre o Carné de Identidad..."
        actionLabel="Añadir Estudiante"
        actionIcon="person_add"
        onAction={() => {}}
        searchComponent={(
          <div ref={searchContainerRef} className="relative w-full">
            <SearchField
              wrapperClassName="w-full"
              placeholder="Buscar estudiante por nombre o Carné de Identidad..."
              value={search}
              onChange={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleInputKeyDown}
              aria-autocomplete="list"
              aria-expanded={isSearchFocused && search.trim().length >= 2}
              aria-controls="student-suggestions-listbox"
              aria-activedescendant={activeSuggestion >= 0 && suggestions[activeSuggestion] ? `student-suggestion-${suggestions[activeSuggestion].id}` : undefined}
            />
            {/* Suggestions dropdown */}
            {isSearchFocused && search.trim().length >= 2 && (
              <div ref={suggestionsRef} id="student-suggestions-listbox" role="listbox" aria-label="Sugerencias de estudiantes" className="absolute left-0 right-0 top-[calc(100%+0.5rem)] bg-[var(--color-surface-container-lowest)] rounded-2xl shadow-[var(--shadow-ambient)] z-50 overflow-hidden border border-[var(--color-outline-variant)]/20">
                {suggestionsQuery.isFetching ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={`suggestion-skeleton-${idx}`} className="px-4 py-3 animate-pulse">
                      <div className="h-4 w-2/3 rounded bg-[var(--color-surface-container-high)]" />
                    </div>
                  ))
                ) : suggestions.length > 0 ? (
                  suggestions.map((s, idx) => (
                    <button
                      key={s.id}
                      id={`student-suggestion-${s.id}`}
                      role="option"
                      aria-selected={activeSuggestion === idx}
                      onMouseDown={(e)=>{e.preventDefault(); setSelectedStudentId(s.id); setIsSearchFocused(false); setActiveSuggestion(-1); setSearch('');}}
                      className={`w-full text-left px-4 py-3 transition-colors ${activeSuggestion === idx ? 'bg-surface-container-high' : 'hover:bg-surface-container-high'}`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-on-surface">{s.full_name || `${s.first_name || ''} ${s.last_name || ''}`.trim()}</span>
                        <span className="text-xs text-on-surface-variant">{s.ci} · {s.student_id}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-on-surface-variant">No se encontraron coincidencias</div>
                )}
              </div>
            )}
          </div>
        )}
      />

      <DashboardFiltersBar
        left={(
          <>
            <DashboardFilterSelect
              className="w-full sm:w-[220px]"
              value={facultyId === 'all' ? 'all' : String(facultyId)}
              onValueChange={(value) => setFacultyId(value === 'all' ? 'all' : Number(value))}
              placeholder="Todas las Facultades"
              options={[
                { value: 'all', label: 'Todas las Facultades' },
                ...faculties.map((f) => ({ value: String(f.id), label: f.name })),
              ]}
            />

            <DashboardFilterSelect
              className="w-full sm:w-[220px]"
              value={buildingId === 'all' ? 'all' : String(buildingId)}
              onValueChange={(value) => setBuildingId(value === 'all' ? 'all' : Number(value))}
              placeholder="Todos los Edificios"
              options={[
                { value: 'all', label: 'Todos los Edificios' },
                ...buildings.map((b) => ({ value: String(b.id), label: b.name })),
              ]}
            />
          </>
        )}
        right={(
          <DashboardSegmentedFilter
            value={locationFilter}
            onValueChange={(value) => setLocationFilter(value as typeof locationFilter)}
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'with_room', label: 'Con Cuarto' },
              { value: 'without_room', label: 'Sin ubicación' },
            ]}
          />
        )}
      />

      {/* Student Table */}
      <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Estudiante</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">CI</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Carrera</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Año</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              
              {isLoading ? (
                // Skeleton rows
                Array.from({length:6}).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-surface-container-high)]" />
                        <div className="h-4 w-56 bg-[var(--color-surface-container-high)] rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-4 w-20 bg-[var(--color-surface-container-high)] rounded" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-32 bg-[var(--color-surface-container-high)] rounded" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-16 bg-[var(--color-surface-container-high)] rounded" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-[var(--color-surface-container-high)] rounded ml-auto" /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-error">
                    Error al cargar los datos: {(error as Error)?.message || "Intente nuevamente"}
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                    No se encontraron estudiantes
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student: Student) => {
                  // Prefer detailed version if we fetched it for the visible rows
                  const detailed = enrichedVisibleDetailsById.get(student.id) as Student | undefined;
                  const source = detailed || student;

                  const fullName = source.full_name || `${source.first_name || ""} ${source.last_name || ""}`.trim() || "Desconocido";
                  const parts = fullName.split(" ");
                  const initials = parts.length > 1 
                                     ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
                                     : `${parts[0]?.[0] || "E"}`.toUpperCase();
                  
                  const ci = source.ci || "-";

                  // Resolve career/year preferring the detailed payload
                  const careerName = detailed?.group_detail?.career_year_detail?.career_name || detailed?.group?.career_year?.career?.name || student.group_name?.split(' — ')[0] || "No especificada";
                  const _m = student.group_name ? student.group_name.match(/(\d+)°\s*Año/) : null;
                  const yearNumber = detailed?.group_detail?.career_year_detail?.year ? `${detailed.group_detail.career_year_detail.year}ro` : (_m ? `${_m[1]}ro` : "-");

                  const isFemale = source.gender?.toUpperCase() === 'F';
                  
                  return (
                    <tr key={student.id} className="hover:bg-[var(--color-primary-selected)] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isFemale ? "bg-pink-100 text-pink-600" : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          }`}>
                            {initials}
                          </div>
                          <div className="font-semibold text-on-surface">{fullName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-on-surface-variant font-medium">{ci}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-on-surface font-medium">{careerName}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-on-surface-variant">{yearNumber || "No especificado"}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            className="p-2 text-outline hover:text-primary transition-colors cursor-pointer" 
                            title="Consultar"
                            onClick={() => setSelectedStudentId(student.id)}
                          >
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </button>
                          <Link href={`/dashboard/estudiantes/${student.id}/editar`} className="p-2 text-outline hover:text-primary transition-colors cursor-pointer" title="Editar">
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </Link>
                          <button className="p-2 text-outline hover:text-yellow-500 transition-colors cursor-pointer" title="Evaluar" onClick={() => setSelectedStudentToEvaluateId(student.id)}>
                            <span className="material-symbols-outlined text-xl">star</span>
                          </button>
                          <button className="p-2 text-outline hover:text-error transition-colors cursor-pointer" title="Dar de Baja" onClick={() => setSelectedStudentToDeleteId(student.id)}>
                            <span className="material-symbols-outlined text-xl">person_remove</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <footer className="px-6 py-4 flex items-center justify-between bg-surface-container-low/30 border-t border-outline-variant/10">
          <div className="text-sm font-medium text-on-surface-variant">
            Página {safePage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
              <button 
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={safePage <= 1}
              onClick={() => setPage(old => Math.max(1, old - 1))}
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button 
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={safePage >= totalPages}
              onClick={() => setPage(old => Math.min(totalPages, old + 1))}
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </footer>
      </section>

      {/* Slide-over panel */}
      <ViewStudentPanel 
        studentId={selectedStudentId} 
        onClose={() => setSelectedStudentId(null)} 
      />

      <DeleteStudentModal
        student={selectedStudentToDelete}
        open={selectedStudentToDeleteId !== null}
        onClose={() => setSelectedStudentToDeleteId(null)}
      />

      <EvaluateStudentModal
        student={selectedStudentToEvaluate}
        open={selectedStudentToEvaluateId !== null}
        onClose={() => setSelectedStudentToEvaluateId(null)}
      />
    </div>
  );
}