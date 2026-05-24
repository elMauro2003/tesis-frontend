import React, { useEffect, useState } from 'react';
import { FetchError } from '@/lib/fetchClient';
import { Student } from '@/types/models';
import { studentService } from '@/core/services/student.service';
import { useQuery } from '@tanstack/react-query';

type StudentCurrentRoom = {
  number?: string;
  wing?: string;
  building?: string;
} | null;

interface ViewStudentPanelProps {
  studentId: number | null;
  onClose: () => void;
}

export function ViewStudentPanel({ studentId, onClose }: ViewStudentPanelProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [currentRoom, setCurrentRoom] = useState<StudentCurrentRoom>(null);
  const [isOpen, setIsOpen] = useState(false);

  const ANIM_MS = 320;

  useEffect(() => {
    if (!studentId) {
      setIsOpen(false);
      return;
    }
    setIsOpen(true);
  }, [studentId]);

  const { data: studentData, isLoading: isStudentLoading, isError: isStudentError, error: studentError } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => (studentId ? studentService.getStudentById(studentId) : Promise.resolve(null as any)),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: roomData, isLoading: isRoomLoading, isError: isRoomError } = useQuery({
    queryKey: ['student-current-room', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      try {
        return await studentService.getStudentCurrentRoom(studentId);
      } catch (err) {
        if (err instanceof FetchError && err.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => { if (studentData) setStudent(studentData); }, [studentData]);
  useEffect(() => {
    if (!roomData) {
      setCurrentRoom(null);
      return;
    }
    // Normalize Room -> StudentCurrentRoom shape
    const wingName = roomData.wing && typeof roomData.wing === 'object' ? roomData.wing.name : (roomData.wing ?? '')?.toString?.() || undefined;
    const buildingName = roomData.wing && typeof roomData.wing === 'object' && roomData.wing.building && typeof roomData.wing.building === 'object'
      ? roomData.wing.building.name
      : undefined;
    setCurrentRoom({
      number: roomData.number,
      wing: wingName,
      building: buildingName,
    });
  }, [roomData]);

  const handleRequestClose = () => {
    setIsOpen(false);
    // wait for animation to finish then notify parent to clear id
    setTimeout(() => onClose(), ANIM_MS);
  };

  // If neither open nor we have student data, don't render DOM
  if (!isOpen && !studentId && !student) return null;

  const fullName = student?.full_name || `${student?.first_name || ""} ${student?.last_name || ""}`.trim() || "Desconocido";
  const parts = fullName.split(" ");
  const initials = parts.length > 1 
                      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() 
                      : `${parts[0]?.[0] || "E"}`.toUpperCase();

  const isFemale = student?.gender?.toUpperCase() === 'F';
    
  // Prefer detail shapes returned by the student detail endpoint (group_detail, career_year_detail)
  const careerName = student?.group_detail?.career_year_detail?.career_name || student?.group?.career_year?.career?.name || "No especificada";
  const groupName = student?.group_detail?.name || student?.group_name || (student?.group && typeof student.group === 'object' ? student.group.name : "No especificado");
  const ageValue = student?.age ?? null;
  const yearValue = student?.group_detail?.career_year_detail?.year ?? student?.group?.career_year?.year ?? null;
  const locationLabel = currentRoom
    ? `${currentRoom.number || 'Sin número'}${currentRoom.wing ? ` · ${currentRoom.wing}` : ''}${currentRoom.building ? ` · ${currentRoom.building}` : ''}`
    : (student?.current_room_info ? `${student.current_room_info.room_number || 'Sin número'}${student.current_room_info.wing ? ` · ${student.current_room_info.wing}` : ''}${student.current_room_info.building ? ` · ${student.current_room_info.building}` : ''}` : 'Sin ubicación');
  const userLabel = typeof student?.user === 'object' && student.user
    ? [student.user.first_name, student.user.last_name].filter(Boolean).join(' ').trim() || student.user.email || 'Usuario vinculado'
    : student?.user
      ? `Usuario #${student.user}`
      : 'No registrado';

  const isLoading = isStudentLoading || isRoomLoading;
  const isError = isStudentError || isRoomError;
  const error = studentError as Error | null;
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleRequestClose}
        aria-hidden
      />
      {/* Panel */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-[var(--color-surface-container-lowest)] shadow-2xl flex flex-col overflow-hidden transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-modal="true">
        
        {/* Header */}
        <header className="bg-[var(--color-surface-container-lowest)] border-b border-[var(--color-outline-variant)]/20 p-6 flex flex-col gap-4 relative">
          <button 
            onClick={handleRequestClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--color-surface-container-low)] text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
            aria-label="Cerrar panel"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="flex items-center gap-4 mt-2">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl ring-4 ring-[var(--color-surface-container-lowest)] shadow-sm ${isFemale ? "bg-pink-100 text-pink-600" : "bg-[var(--color-primary-light)] text-[var(--color-primary)]"}`}>
              {isLoading ? (
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-container-high)] animate-pulse" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h3 className="text-2xl font-headline font-bold text-[var(--color-primary-dark)] leading-tight">{isLoading ? <span className="block w-40 h-6 bg-[var(--color-surface-container-high)] animate-pulse rounded-md"></span> : fullName}</h3>
              <p className="text-[var(--color-on-surface-variant)] font-medium mt-1">{isLoading ? <span className="block w-24 h-4 bg-[var(--color-surface-container-high)] animate-pulse rounded-md"></span> : `CI: ${student?.ci || '-'}`}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] text-xs font-bold border border-[var(--color-outline-variant)]/30">
              {isLoading ? <span className="inline-block w-20 h-3 bg-[var(--color-surface-container-high)] animate-pulse rounded"></span> : careerName}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] text-xs font-bold border border-[var(--color-outline-variant)]/30">
              {isLoading ? <span className="inline-block w-12 h-3 bg-[var(--color-surface-container-high)] animate-pulse rounded"></span> : (currentRoom ? `${currentRoom.number || 'Sin número'}${currentRoom.wing ? ` · ${currentRoom.wing}` : ''}` : 'Sin ubicación')}
            </span>
          </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[var(--color-surface)]">
          {/* Contacto y Origen */}
          <section className="soft-lift-card p-5 border border-ghost">
            <h4 className="text-[10px] uppercase text-[var(--color-outline)] font-extrabold tracking-widest mb-4">Contacto y Origen</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              <div className="col-span-2">
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Dirección</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">{isLoading ? <span className="block w-full h-4 bg-[var(--color-surface-container-high)] animate-pulse rounded-md"></span> : ('No registrada')}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Celular</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">{isLoading ? <span className="block w-28 h-4 bg-[var(--color-surface-container-high)] animate-pulse rounded-md"></span> : ('No registrado')}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Teléfono Familiar</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">{isLoading ? <span className="block w-28 h-4 bg-[var(--color-surface-container-high)] animate-pulse rounded-md"></span> : ('No registrado')}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Sexo</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">{isLoading ? <span className="block w-20 h-4 bg-[var(--color-surface-container-high)] animate-pulse rounded-md"></span> : (student?.gender === 'F' ? 'Femenino' : 'Masculino')}</p>
              </div>
            </div>
          </section>

          {/* Academia y Ubicación */}
          <section className="soft-lift-card p-5 border border-ghost">
            <h4 className="text-[10px] uppercase text-[var(--color-outline)] font-extrabold tracking-widest mb-4">Academia y Ubicación</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Facultad</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">No especificada</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Carrera</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">{careerName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Rendimiento</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">No disponible</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Cuarto</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">
                  {currentRoom ? (
                    <span>{currentRoom.number}{currentRoom.wing ? ` · ${currentRoom.wing}` : ''}{currentRoom.building ? ` · ${currentRoom.building}` : ''}</span>
                  ) : student?.current_room_info ? (
                    <span>{student.current_room_info.room_number}{student.current_room_info.wing ? ` · ${student.current_room_info.wing}` : ''}{student.current_room_info.building ? ` · ${student.current_room_info.building}` : ''}</span>
                  ) : (
                    'No asignado'
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Salud y Perfil */}
          <section className="soft-lift-card p-5 border border-ghost">
            <h4 className="text-[10px] uppercase text-[var(--color-outline)] font-extrabold tracking-widest mb-4">Salud y Perfil</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Enfermedades</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">No registrado</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Medicamentos</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">No registrado</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Trayectoria Disciplinaria</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">No registrada</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {student?.is_militant ? (
                <span className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] text-[11px] font-bold border border-ghost">
                  Militante UJC
                </span>
              ) : (
                <span className="text-sm text-[var(--color-outline)] font-medium">No registrado</span>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-[var(--color-outline-variant)]/20 p-4 bg-[var(--color-surface-container-lowest)] flex justify-end gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 font-bold text-sm hover:bg-[var(--color-surface-container-low)] transition-colors border border-ghost cursor-pointer">
            <span className="material-symbols-outlined text-lg">edit</span>
            Editar Datos
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-lg text-slate-600 font-bold text-sm hover:bg-[var(--color-surface-container-low)] transition-colors cursor-pointer"
          >
            Cerrar Panel
          </button>
        </footer>
      </div>
    </>
  );
}