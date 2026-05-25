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

type CareerOption = { id: number; name: string };
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
  const [careerId, setCareerId] = useState<number | 'all'>('all');
  const [groupId, setGroupId] = useState<number | 'all'>('all');
  const [gender, setGender] = useState<'M' | 'F' | 'all'>('all');
  const [isMilitant, setIsMilitant] = useState<boolean | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'with_room' | 'without_room'>('all');

  const [careers, setCareers] = useState<CareerOption[]>([]);
  const [faculties, setFaculties] = useState<Array<{id:number;name:string}>>([]);
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
      groupId,
      careerId,
      gender,
      isMilitant,
    ],
    queryFn: () => studentService.getAllStudents({
      page_size: 100,
      search: debouncedSearch,
      group: groupId === 'all' ? undefined : groupId,
      gender: gender === 'all' ? undefined : gender,
      is_militant: isMilitant === 'all' ? undefined : isMilitant,
    }),
    staleTime: 60 * 1000,
  });

  const allStudents = studentsQuery.data?.results ?? [];
  // Helper to normalize student.group into a Group-like object using loaded `groups`
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

  const careerFilteredStudents = useMemo(() => {
    if (careerId === 'all') return allStudents;
    return allStudents.filter((student) => {
      // student.group may be: string (group name), number (id) or object
      const g = resolveStudentGroup(student);
      return g?.career_year && (typeof g.career_year.career === 'object' ? g.career_year.career.id : g.career_year.career) === careerId;
    });
  }, [allStudents, careerId]);

  const locationFilteredStudents = useMemo(() => {
    if (locationFilter === 'all') return careerFilteredStudents;
    return careerFilteredStudents.filter((student) => {
      // Prefer server-provided boolean when available to avoid extra requests
      const hasRoom = typeof (student as any).has_room === 'boolean' ? (student as any).has_room : assignedStudentIds.has(student.id);
      return locationFilter === 'with_room' ? hasRoom : !hasRoom;
    });
  }, [careerFilteredStudents, assignedStudentIds, locationFilter]);

  const totalPages = Math.max(1, Math.ceil(locationFilteredStudents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedStudents = useMemo(
    () => locationFilteredStudents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [locationFilteredStudents, safePage]
  );

  // Fetch full student details for the currently visible rows to ensure all relations are loaded
  const visibleStudentIds = paginatedStudents.map(s => s.id);
  const visibleDetailsQuery = useQuery({
    queryKey: ['students-visible-details', visibleStudentIds, debouncedSearch, careerId, groupId, gender, isMilitant],
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
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
  }, [debouncedSearch, careerId, groupId, gender, isMilitant, locationFilter]);

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
    <>
      <header className="mb-10 flex items-center justify-between">
        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-[var(--color-primary-dark)]">Estudiantes</h2>
        <div className="flex items-center gap-4">
          {/* Primary CTA */}
          <Link href="/dashboard/estudiantes/nueva" className="flex items-center gap-2 bg-primary text-on-primary font-bold text-sm px-4 py-2 rounded-lg shadow-[var(--shadow-primary-btn)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Añadir Estudiante</span>
          </Link>
          
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors relative cursor-pointer">
            <span className="material-symbols-outlined font-normal text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
          </button>
          
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high ring-2 ring-surface-container-lowest shadow-sm overflow-hidden text-primary font-bold cursor-default">
            {user ? `${user.username?.[0] || 'U'}`.toUpperCase() : 'U'}
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      <section className="space-y-6 mb-8">
        {/* Top Row Search */}
        <div ref={searchContainerRef} className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input 
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface outline-none" 
            placeholder="Buscar estudiante por nombre o Carné de Identidad..." 
            type="text" 
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
            <div ref={suggestionsRef} id="student-suggestions-listbox" role="listbox" aria-label="Sugerencias de estudiantes" className="absolute left-4 right-4 mt-2 bg-surface-container-lowest rounded-lg shadow-md z-50 overflow-hidden">
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

        {/* Bottom Row Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={careerId} onChange={(e) => setCareerId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="appearance-none bg-surface-container-low border-none rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors focus:ring-0 outline-none">
                <option value="all">Carrera: Todas</option>
                {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">expand_more</span>
            </div>
            
            <div className="relative">
              <select value={groupId} onChange={(e) => setGroupId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="appearance-none bg-surface-container-low border-none rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors focus:ring-0 outline-none">
                <option value="all">Grupo: Todos</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">expand_more</span>
            </div>
          </div>

          {/* Segmented Control */}
          <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1">
            <button onClick={() => setLocationFilter('all')} className={`px-6 py-2 text-sm font-medium rounded-lg ${locationFilter==='all' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'} transition-colors cursor-pointer`}>Todos</button>
            <button onClick={() => setLocationFilter('with_room')} className={`px-6 py-2 text-sm font-medium rounded-lg ${locationFilter==='with_room' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'} transition-colors cursor-pointer`}>Con Cuarto</button>
            <button onClick={() => setLocationFilter('without_room')} className={`px-6 py-2 text-sm font-medium rounded-lg ${locationFilter==='without_room' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'} transition-colors cursor-pointer`}>Sin ubicación</button>
          </div>
        </div>
      </section>

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
    </>
  );
}