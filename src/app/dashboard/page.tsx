"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuthStore();

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
          
          <img 
            alt="Admin" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-container-lowest shadow-sm" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTV-KSX0HQzECPdUkTeEDWm1dYGQSkLsTzZY9g1TquBxpb-V7-S60sAqrsf0j8e78crfAB-O06XsS9PykFAYE5oC8lpnYiDB8aBKQqEzoJGgNhwzz-x8zzBmq8eoedor33_DxhnoMW3Rpeu_6v9nJwg2953ELS1RPZtsl7Fe2FpuUS9K89-GSWzkrACOQ4V9qBGEG73IgBthp9-zgq1bWF5h9AlpsOMV0XcK47oNYS2c-c9Gtx0geNsnuojfNV8AsjS1fsMWtQqg" 
          />
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
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Carrera</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Año</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Estado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              
              {/* Student Row 1 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">AM</div>
                    <div>
                      <div className="font-semibold text-on-surface">Alejandro Martínez</div>
                      <div className="text-xs text-on-surface-variant">CI: 01020344556</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-on-surface font-medium">Ingeniería Informática</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-on-surface-variant">3ro</div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-tertiary-fixed)] text-tertiary border border-[var(--color-tertiary-fixed-dim)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-2"></span>
                    Pendiente
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 text-outline hover:text-primary transition-colors" title="Consultar">
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    <button className="p-2 text-outline hover:text-primary transition-colors" title="Editar">
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button className="p-2 text-outline hover:text-[--color-tertiary] transition-colors" title="Evaluar">
                      <span className="material-symbols-outlined text-xl">star</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all" title="Asignar Cuarto">
                      <span className="material-symbols-outlined text-xl">bed</span>
                    </button>
                    <button className="p-2 text-outline hover:text-error transition-colors" title="Dar de Baja">
                      <span className="material-symbols-outlined text-xl">person_remove</span>
                    </button>
                  </div>
                </td>
              </tr>
              
              {/* Student Row 2 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">BR</div>
                    <div>
                      <div className="font-semibold text-on-surface">Beatriz Rodríguez</div>
                      <div className="text-xs text-on-surface-variant">CI: 02051288991</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-on-surface font-medium">Licenciatura en Letras</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-sm text-on-surface-variant">1ro</div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-tertiary-fixed)] text-tertiary border border-[var(--color-tertiary-fixed-dim)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-2"></span>
                    Pendiente
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 text-outline hover:text-primary transition-colors" title="Consultar">
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    <button className="p-2 text-outline hover:text-primary transition-colors" title="Editar">
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button className="p-2 text-outline hover:text-[--color-tertiary] transition-colors" title="Evaluar">
                      <span className="material-symbols-outlined text-xl">star</span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all" title="Asignar Cuarto">
                      <span className="material-symbols-outlined text-xl">bed</span>
                    </button>
                    <button className="p-2 text-outline hover:text-error transition-colors" title="Dar de Baja">
                      <span className="material-symbols-outlined text-xl">person_remove</span>
                    </button>
                  </div>
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <footer className="px-6 py-4 flex items-center justify-between bg-surface-container-low/30 border-t border-outline-variant/10">
          <div className="text-sm font-medium text-on-surface-variant">
            Página 1 de 10
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all shadow-sm">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}