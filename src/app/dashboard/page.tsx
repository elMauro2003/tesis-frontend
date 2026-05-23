"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useStudents } from "@/features/students/hooks/useStudents";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading, isError, error } = useStudents({ 
    page, 
    search: debouncedSearch 
  });

  const students = data?.results || [];
  const totalPages = data ? Math.ceil(data.count / 10) : 1; // Assuming page_size is 10

  // For handling input with simple debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  const handleSearchBlur = () => {
    setDebouncedSearch(search);
    setPage(1); // Reset page on new search
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setDebouncedSearch(search);
      setPage(1);
    }
  };

  return (
    <>
      <header className="mb-10 flex items-center justify-between">
        <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary-container">Estudiantes</h2>
        <div className="flex items-center gap-4">
          {/* Primary CTA with Gradient */}
          <button className="flex items-center gap-2 bg-brand-gradient text-on-primary font-bold text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span>Añadir Estudiante</span>
          </button>
          
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors relative">
            <span className="material-symbols-outlined font-normal text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
          </button>
          
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high ring-2 ring-surface-container-lowest shadow-sm overflow-hidden text-primary font-bold">
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
        </div>

        {/* Bottom Row Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-surface-container-low border-none rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors focus:ring-0 outline-none">
                <option>Facultad: Todas</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">expand_more</span>
            </div>
            
            <div className="relative">
              <select className="appearance-none bg-surface-container-low border-none rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors focus:ring-0 outline-none">
                <option>Carrera: Todas</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">expand_more</span>
            </div>
            
            <button className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all">
              <span className="material-symbols-outlined text-lg">add</span>
              <span className="text-sm font-medium">Añadir filtro</span>
            </button>
          </div>

          {/* Segmented Control */}
          <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1">
            <button className="px-6 py-2 text-sm font-medium rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">Todos</button>
            <button className="px-6 py-2 text-sm font-medium rounded-lg text-on-surface-variant hover:text-on-surface transition-colors">Con Cuarto</button>
            <button className="px-6 py-2 text-sm font-medium rounded-lg bg-primary-container text-on-primary shadow-sm">Pendientes</button>
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
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">
                    Cargando estudiantes...
                  </td>
                </tr>
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
                students.map((student) => {
                  const fullName = student.full_name || `${student.first_name || ""} ${student.last_name || ""}`.trim() || "Desconocido";
                  const parts = fullName.split(" ");
                  const initials = parts.length > 1 
                                     ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
                                     : `${parts[0]?.[0] || "E"}`.toUpperCase();
                  
                  const ci = student.ci || "-";

                  const careerName = student.group?.career_year?.career?.name || "No especificada";
                  const yearNumber = student.group?.career_year?.year ? `${student.group.career_year.year}ro` : "-";
                  
                  return (
                    <tr key={student.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">
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
                          <button className="p-2 text-outline hover:text-primary transition-colors" title="Consultar">
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </button>
                          <button className="p-2 text-outline hover:text-primary transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button className="p-2 text-outline hover:text-error transition-colors" title="Dar de Baja">
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
    </>
  );
}