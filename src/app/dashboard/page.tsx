"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents } from "@/features/students/hooks/useStudents";
import { ViewStudentPanel } from "@/features/students/components/ViewStudentPanel";
import { Student } from "@/types/models";
import { fetchClient } from '@/lib/fetchClient';
import { studentService } from '@/core/services/student.service';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // Filters
  const [careerId, setCareerId] = useState<number | 'all'>('all');
  const [groupId, setGroupId] = useState<number | 'all'>('all');
  const [gender, setGender] = useState<'M' | 'F' | 'all'>('all');
  const [isMilitant, setIsMilitant] = useState<boolean | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'with_room' | 'without_room'>('all');

  const [careers, setCareers] = useState<Array<{id:number,name:string}>>([]);
  const [groups, setGroups] = useState<Array<{id:number,name:string}>>([]);

  // Suggestions
  const [suggestions, setSuggestions] = useState<Student[]>([]);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const PAGE_SIZE = 10;

  const { data, isLoading, isError, error } = useStudents({ 
    page,
    page_size: PAGE_SIZE,
    search: debouncedSearch,
    group: groupId === 'all' ? undefined : groupId,
    gender: gender === 'all' ? undefined : gender,
    is_militant: isMilitant === 'all' ? undefined : isMilitant,
  });

  const students = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 1;

  const displayedStudents = students.filter(s => {
    if (locationFilter === 'all') return true;
    const hasRoom = Boolean((s as any).room || (s as any).current_room || (s as any).assignment || (s as any).room_assignment);
    return locationFilter === 'with_room' ? hasRoom : !hasRoom;
  });

  // For handling input with simple debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  const handleSearchBlur = () => {
    setDebouncedSearch(search);
    setPage(1); // Reset page on new search
  };

  // Fetch careers and groups for filters
  useEffect(() => {
    let mounted = true;
    fetchClient('/api/v1/carreras/')
      .then((res: any) => { if (!mounted) return; setCareers(res.results || res); })
      .catch(() => {})
    ;

    fetchClient('/api/v1/grupos/')
      .then((res: any) => { if (!mounted) return; setGroups(res.results || res); })
      .catch(() => {})
    ;

    return () => { mounted = false; };
  }, []);

  // Debounce search and fetch suggestions
  useEffect(() => {
    const deb = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(deb);
  }, [search]);

  // Reset page when server-side filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, careerId, groupId, gender, isMilitant]);

  useEffect(() => {
    if (!search || search.length < 2) { setSuggestions([]); return; }
    let mounted = true;
    studentService.getStudents({ search, page_size: 5 })
      .then((res) => { if (!mounted) return; setSuggestions(res.results || []); })
      .catch(() => { if (!mounted) return; setSuggestions([]); });
    return () => { mounted = false; };
  }, [search]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setDebouncedSearch(search);
      setPage(1);
    }
  };

  return (
    <>
      <header className="mb-10 flex items-center justify-between">
        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-[var(--color-primary-dark)]">Estudiantes</h2>
        <div className="flex items-center gap-4">
          {/* Primary CTA */}
          <button className="flex items-center gap-2 bg-primary text-on-primary font-bold text-sm px-4 py-2 rounded-lg shadow-[var(--shadow-primary-btn)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Añadir Estudiante</span>
          </button>
          
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
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input 
            className="w-full bg-surface-container-low border-none rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface outline-none" 
            placeholder="Buscar estudiante por nombre o Carné de Identidad..." 
            type="text" 
            value={search}
            onChange={handleSearch}
            onBlur={handleSearchBlur}
            onKeyDown={handleKeyDown}
          />
          {/* Suggestions dropdown */}
          {suggestions.length > 0 && search.length >= 2 && (
            <div ref={suggestionsRef} className="absolute left-4 right-4 mt-2 bg-surface-container-lowest rounded-lg shadow-md z-50">
              {suggestions.map(s => (
                <button key={s.id} onMouseDown={(e)=>{e.preventDefault(); setSelectedStudentId(s.id); setSuggestions([]); setSearch('');}} className="w-full text-left px-4 py-2 hover:bg-surface-container-high transition-colors">{s.full_name || `${s.first_name} ${s.last_name}`} — {s.ci}</button>
              ))}
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
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                    No se encontraron estudiantes
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student) => {
                  const fullName = student.full_name || `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Desconocido";
                  const parts = fullName.split(" ");
                  const initials = parts.length > 1 
                                     ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
                                     : `${parts[0]?.[0] || "E"}`.toUpperCase();
                  
                  const ci = student.ci || "-";

                  const careerName = student.group?.career_year?.career?.name || "No especificada";
                  const yearNumber = student.group?.career_year?.year ? `${student.group.career_year.year}ro` : "-";
                  
                  const isFemale = student.gender?.toUpperCase() === 'F';
                  
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
                          <button className="p-2 text-outline hover:text-primary transition-colors cursor-pointer" title="Editar">
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button className="p-2 text-outline hover:text-error transition-colors cursor-pointer" title="Dar de Baja">
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
            Página {page} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={page <= 1}
              onClick={() => setPage(old => Math.max(1, old - 1))}
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button 
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page >= totalPages}
              onClick={() => setPage(old => (data && data.next ? old + 1 : old))}
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
    </>
  );
}