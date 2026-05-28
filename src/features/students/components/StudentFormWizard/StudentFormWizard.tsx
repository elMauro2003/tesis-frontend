"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  studentService 
} from "@/core/services/student.service";
import {
  accommodationService,
} from "@/core/services/accommodation.service";
import { 
  academicService 
} from "@/core/services/academic.service";
import {
  infrastructureService,
} from "@/core/services/infrastructure.service";
import { 
  StudentCreateRequest, 
  Student,
  Faculty,
  Career,
  AcademicYear as CareerYear,
  Group,
  Room
} from "@/types/models";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { toast } from "sonner";

interface StudentFormWizardProps {
  initialStudentId?: number;
}

type SubmissionStage = "idle" | "saving-student" | "releasing-room" | "assigning-room";

const isRoomSelectable = (room: Room) => {
  const currentOccupancy = room.current_occupancy ?? room.occupancy ?? 0;
  return room.is_active && !room.is_full && currentOccupancy < room.capacity;
};

const getRoomLabel = (room: Room) => {
  const wing = room.wing && typeof room.wing === "object" ? room.wing : null;
  const building = wing && wing.building && typeof wing.building === "object" ? wing.building : null;
  const currentOccupancy = room.current_occupancy ?? room.occupancy ?? 0;
  const occupancyLabel = room.capacity > 0 ? `${currentOccupancy}/${room.capacity}` : "";

  return [
    building?.name,
    wing?.name,
    `Cuarto ${room.number}`,
    room.available_spots !== undefined ? `${room.available_spots} libres` : occupancyLabel,
  ].filter(Boolean).join(" · ");
};

const getRoomIdFromStudent = (student: Student) => {
  const roomId = student.current_room_info?.room_id;
  return typeof roomId === "number" ? roomId : null;
};

export default function StudentFormWizard({ initialStudentId }: StudentFormWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [fetchingInitial, setFetchingInitial] = useState(!!initialStudentId);
  const isEditing = !!initialStudentId;
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>("idle");
  const [persistedStudentId, setPersistedStudentId] = useState<number | null>(initialStudentId ?? null);

  // Step 1 State
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [ci, setCi] = useState("");
  const [student_id, setStudentId] = useState("");
  const [gender, setGender] = useState("");
  const [birth_date, setBirthDate] = useState("");
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [emergency_phone, setEmergencyPhone] = useState("");

  // Step 2 State
  const [facultyId, setFacultyId] = useState<number | "">("");
  const [careerId, setCareerId] = useState<number | "">("");
  const [careerYearId, setCareerYearId] = useState<number | "">("");
  const [groupId, setGroupId] = useState<number | "">("");
  const [academic_performance, setAcademicPerformance] = useState("");

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [careerYears, setCareerYears] = useState<CareerYear[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | "">("");
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [currentRoomSnapshot, setCurrentRoomSnapshot] = useState<Room | null>(null);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<number | null>(null);

  // Step 3 State
  const [illnesses, setIllnesses] = useState("");
  const [medications, setMedications] = useState("");
  const [disciplinary_process, setDisciplinaryProcess] = useState("");
  const [is_militant, setIsMilitant] = useState(false);
  const [is_cadet_minint, setIsCadetMinint] = useState(false);
  const [is_cadet_far, setIsCadetFar] = useState(false);

  // Fetch initial academic data
  useEffect(() => {
    academicService.getFaculties().then(res => setFaculties(res.results)).catch(console.error);
  }, []);

  useEffect(() => {
    if (facultyId) {
      academicService.getCareers(Number(facultyId)).then(res => setCareers(res.results)).catch(console.error);
    } else {
      setCareers([]);
      setCareerId("");
    }
  }, [facultyId]);

  useEffect(() => {
    if (careerId) {
      academicService.getAcademicYears(Number(careerId)).then(res => setCareerYears(res.results)).catch(console.error);
    } else {
      setCareerYears([]);
      setCareerYearId("");
    }
  }, [careerId]);

  useEffect(() => {
    if (careerYearId) {
      academicService.getGroups(Number(careerYearId)).then(res => setGroups(res.results)).catch(console.error);
    } else {
      setGroups([]);
      setGroupId("");
    }
  }, [careerYearId]);

  useEffect(() => {
    let cancelled = false;

    setRoomsLoading(true);
    infrastructureService.getAvailableRooms()
      .then((response) => {
        if (cancelled) return;
        setRooms(response.results.filter(isRoomSelectable));
      })
      .catch((error) => {
        console.error(error);
        toast.error("No se pudieron cargar los cuartos", {
          description: "Revise su conexión o la disponibilidad de la API e inténtelo nuevamente.",
        });
      })
      .finally(() => {
        if (!cancelled) {
          setRoomsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Load Edit Data
  useEffect(() => {
    if (initialStudentId) {
      studentService.getStudentById(initialStudentId)
        .then(async (student) => {
          setPersistedStudentId(initialStudentId);
          setFirstName(student.user && typeof student.user === 'object' ? student.user.first_name || "" : student.first_name || "");
          setLastName(student.user && typeof student.user === 'object' ? student.user.last_name || "" : student.last_name || "");
          setEmail(student.user && typeof student.user === 'object' ? student.user.email || "" : "");
          // For editing, username/password aren't strictly required or may be unchangeable from here
          // We will omit them or send conditionally
          setCi(student.ci || "");
          setStudentId(student.student_id || "");
          setGender(student.gender || "");
          setBirthDate(student.birth_date || "");
          setProvince(student.province || "");
          setMunicipality(student.municipality || "");
          setAddress(student.address || "");
          setPhone(student.phone || "");
          setEmergencyPhone(student.emergency_phone || "");

          if (student.group) {
              setGroupId(student.group.id);
              // In a real flow, we'd back-populate facultyId, careerId etc. By saving groupId it might be enough to submit
              // But to show in UI we need them all
              // Just manually set them if possible from the nested object
              // E.g., student.group.career_year.career... wait people.types.ts only shows up to career
          }
          
          setAcademicPerformance(student.academic_performance || "");
          
          setIllnesses(student.illnesses || "");
          setMedications(student.medications || "");
          setDisciplinaryProcess(student.disciplinary_process || "");
          setIsMilitant(!!student.is_militant);
          setIsCadetMinint(!!student.is_cadet_minint);
          setIsCadetFar(!!student.is_cadet_far);

          const roomIdFromStudent = getRoomIdFromStudent(student);

          if (roomIdFromStudent) {
            setCurrentRoomId(roomIdFromStudent);
            setSelectedRoomId(roomIdFromStudent);
          }

          try {
            const currentRoomPromise = studentService.getStudentCurrentRoom(initialStudentId);
            const assignmentPromise = roomIdFromStudent
              ? Promise.resolve(null)
              : accommodationService.getAssignments({ student: initialStudentId, is_active: true, page: 1 });

            const [currentRoom, assignmentResponse] = await Promise.all([currentRoomPromise, assignmentPromise]);

            setCurrentRoomId(currentRoom.id);
            setCurrentRoomSnapshot(currentRoom);
            setSelectedRoomId((previousRoomId) => previousRoomId || currentRoom.id);

            if (assignmentResponse && assignmentResponse.results.length > 0) {
              setCurrentAssignmentId(assignmentResponse.results[0].id);
            }

            if (student.current_room_info?.assignment_id) {
              setCurrentAssignmentId(student.current_room_info.assignment_id);
            }
          } catch (assignmentError) {
            if (!((assignmentError as { status?: number }).status === 404)) {
              console.error(assignmentError);
            }
          }

          setFetchingInitial(false);
        })
        .catch((e) => {
          console.error(e);
          setFetchingInitial(false);
        });
    }
  }, [initialStudentId]);

  // Helpers to mock removed fields from UI
  const extractBirthDate = (ciString: string) => {
    if (ciString.length >= 6) {
      const year = parseInt(ciString.substring(0,2), 10);
      const month = ciString.substring(2,4);
      const day = ciString.substring(4,6);
      const fullYear = year > 30 ? `19${ciString.substring(0,2)}` : `20${ciString.substring(0,2)}`;
      return `${fullYear}-${month}-${day}`;
    }
    return '2000-01-01'; 
  }

  const roomOptions = useMemo(() => {
    const options = [...rooms];

    if (currentRoomSnapshot && !options.some((room) => room.id === currentRoomSnapshot.id)) {
      options.unshift(currentRoomSnapshot);
    }

    if (!currentRoomSnapshot && currentRoomId !== null && !options.some((room) => room.id === currentRoomId)) {
      options.unshift({
        id: currentRoomId,
        number: String(currentRoomId),
        wing: 0,
        capacity: 0,
        is_active: true,
        current_occupancy: 0,
      } as Room);
    }

    return options;
  }, [rooms, currentRoomId, currentRoomSnapshot]);

  const submissionLabel = submissionStage === "saving-student"
    ? (isEditing ? "Actualizando estudiante" : "Creando estudiante")
    : submissionStage === "releasing-room"
      ? "Liberando cuarto anterior"
      : "Asignando cuarto";

  const submissionDetail = submissionStage === "saving-student"
    ? "Estamos guardando la información principal del estudiante."
    : submissionStage === "releasing-room"
      ? "Se detectó un cambio de cuarto y primero debemos liberar la asignación anterior."
      : "Estamos conectando al estudiante con el cuarto seleccionado.";

  const shouldShowCurrentRoom = Boolean(isEditing && currentRoomSnapshot);

  const createOrUpdateStudent = async () => {
    const payload: Partial<StudentCreateRequest> = {
      first_name,
      last_name,
      ci,
      student_id: ci,
      email: email || undefined,
      gender,
      birth_date: extractBirthDate(ci),
      province,
      municipality,
      address,
      phone,
      emergency_phone,
      group: groupId ? Number(groupId) : 1,
      academic_performance,
      illnesses,
      medications,
      disciplinary_process,
      is_militant,
      is_cadet_minint,
      is_cadet_far,
    };

    if (!isEditing && !persistedStudentId) {
      payload.username = username;
      payload.password = password;
      payload.email = email;
      setSubmissionStage("saving-student");
      const createdStudent = await studentService.createStudent(payload as StudentCreateRequest);
      setPersistedStudentId(createdStudent.id);
      return createdStudent.id;
    }

    if (!isEditing && persistedStudentId) {
      setSubmissionStage("saving-student");
      await studentService.updateStudent(persistedStudentId, payload);
      return persistedStudentId;
    }

    if (isEditing) {
      setSubmissionStage("saving-student");
      const updatedStudent = await studentService.updateStudent(initialStudentId!, payload);
      setPersistedStudentId(updatedStudent.id ?? initialStudentId!);
      return updatedStudent.id ?? initialStudentId!;
    }

    return persistedStudentId;
  };

  const assignRoomToStudent = async (studentId: number) => {
    if (selectedRoomId === "") {
      throw new Error("Debe seleccionar un cuarto antes de continuar.");
    }

    const roomId = Number(selectedRoomId);
    const roomHasChanged = currentRoomId !== roomId;

    if (isEditing && currentAssignmentId && roomHasChanged) {
      setSubmissionStage("releasing-room");
      await accommodationService.releaseAssignment(currentAssignmentId);
      setCurrentAssignmentId(null);
    }

    if (!isEditing || roomHasChanged || currentRoomId === null) {
      setSubmissionStage("assigning-room");
      await accommodationService.createAssignment({
        student: studentId,
        room: roomId,
        assigned_date: new Date().toISOString().slice(0, 10),
      });
    }
  };

  const handleSubmit = async () => {
    if (!isEditing && !persistedStudentId) {
      if (!username || !password || !email) {
        toast.warning("Faltan datos de cuenta", { description: "Por favor, complete usuario, contraseña y correo." });
        return;
      }
      if (!/^[\w.@+-]+$/.test(username)) {
        toast.warning("Formato de usuario inválido", { description: "Solo letras, números y los caracteres @/./+/-/_" });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.warning("Correo inválido", { description: "Inserte un formato de correo electrónico válido." });
        return;
      }
    }

    if (selectedRoomId === "") {
      toast.warning("Falta el cuarto", {
        description: "Debe seleccionar el cuarto donde quedará ubicado el estudiante.",
      });
      return;
    }

    try {
      const studentId = await createOrUpdateStudent();

      if (studentId) {
        await assignRoomToStudent(studentId);
      }

      toast.success(isEditing ? "Estudiante actualizado" : "Estudiante creado", {
        description: "La información y la asignación de cuarto se completaron correctamente.",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting student", error);

      let errorMsg = "Verifique su conexión y los datos ingresados.";
      if (error instanceof Error && error.message) {
        errorMsg = error.message;
      } else if (error && typeof error === "object" && "data" in error) {
        const typedError = error as { status?: number; data?: { error?: { message?: string }; message?: string } };
        if (typedError.data?.error?.message) {
          errorMsg = typedError.data.error.message;
        } else if (typedError.data?.message) {
          errorMsg = typedError.data.message;
        } else if (typedError.status === 400) {
          errorMsg = "Existen errores de validación. Revise el estudiante o el cuarto seleccionado.";
        } else if (typedError.status === 500) {
          errorMsg = "Ocurrió un error interno en el servidor durante el guardado o la asignación.";
        }
      }

      toast.error("Ocurrió un error al guardar", {
        description: errorMsg,
      });
    } finally {
      setSubmissionStage("idle");
    }
  };

  if (fetchingInitial) return <div className="p-10">Cargando datos del estudiante...</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Stepper */}
      <div className="bg-[var(--color-surface-container-lowest)] rounded-xl p-8 mb-8 shadow-[var(--shadow-ambient)] shrink-0">
        <div className="flex items-center w-full max-w-4xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-2 relative z-10 w-32">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= 1 ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] ring-4 ring-[var(--color-primary-fixed)] shadow-lg' : 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)]'}`}>
              {step > 1 ? <span className="material-symbols-outlined text-lg">check</span> : "1"}
            </div>
            <span className={`font-bold text-sm text-center transition-colors ${step >= 1 ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`}>Datos Personales</span>
          </div>
          {/* Connector 1 */}
          <div className="flex-1 h-1.5 bg-[var(--color-surface-container-highest)] mx-2 relative overflow-hidden rounded-full">
            <div className={`absolute left-0 top-0 h-full bg-[var(--color-primary)] transition-all duration-500 ease-out ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
          </div>
          {/* Step 2 */}
          <div className="flex flex-col items-center gap-2 relative z-10 w-32">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= 2 ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] ring-4 ring-[var(--color-primary-fixed)] shadow-lg' : 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)]'}`}>
              {step > 2 ? <span className="material-symbols-outlined text-lg">check</span> : "2"}
            </div>
            <span className={`font-medium text-sm text-center transition-colors ${step >= 2 ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-on-surface-variant)]'}`}>Datos Académicos</span>
          </div>
          {/* Connector 2 */}
          <div className="flex-1 h-1.5 bg-[var(--color-surface-container-highest)] mx-2 relative overflow-hidden rounded-full">
             <div className={`absolute left-0 top-0 h-full bg-[var(--color-primary)] transition-all duration-500 ease-out ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
          </div>
          {/* Step 3 */}
          <div className="flex flex-col items-center gap-2 relative z-10 w-32">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= 3 ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] ring-4 ring-[var(--color-primary-fixed)] shadow-lg' : 'bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)]'}`}>
              3
            </div>
            <span className={`font-medium text-sm text-center transition-colors ${step >= 3 ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-on-surface-variant)]'}`}>Salud y Perfil</span>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-[0_20px_40px_rgba(0,55,176,0.06)] overflow-y-auto flex-1 flex flex-col">
        <div className="p-8 flex-1">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4 border-b border-surface-container pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Información Personal y de Contacto
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Row 1 */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Nombres <span className="text-[var(--color-error)]">*</span></label>
                  <input required value={first_name} onChange={e => setFirstName(e.target.value)} type="text" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="Ej. Juan Carlos"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Apellidos <span className="text-[var(--color-error)]">*</span></label>
                  <input required value={last_name} onChange={e => setLastName(e.target.value)} type="text" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="Ej. Pérez García"/>
                </div>

                {/* Row 2 */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Carné de Identidad <span className="text-[var(--color-error)]">*</span></label>
                  <input required value={ci} onChange={e => setCi(e.target.value)} type="text" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="Ej. 01051512345"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Sexo <span className="text-[var(--color-error)]">*</span></label>
                  <select required value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold appearance-none">
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                {/* Row 3 */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Provincia</label>
                  <input value={province} onChange={e => setProvince(e.target.value)} type="text" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="Ej. Villa Clara"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Municipio</label>
                  <input value={municipality} onChange={e => setMunicipality(e.target.value)} type="text" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="Ej. Santa Clara"/>
                </div>

                {/* Row 4 */}
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Dirección Particular</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} type="text" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="Calle, Número, Reparto..."/>
                </div>
                
                {/* Row 5 */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Teléfono Móvil</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-4 text-[var(--color-outline)] text-lg">call</span>
                    <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 pl-12 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="+53 51234567"/>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Teléfono de Contacto (Familiar)</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-4 text-[var(--color-outline)] text-lg">home_iot_device</span>
                    <input value={emergency_phone} onChange={e => setEmergencyPhone(e.target.value)} type="tel" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 pl-12 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="Ej. 42123456"/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="mb-4 border-b border-[var(--color-outline-variant)]/40 pb-4">
                <h3 className="text-lg font-bold text-[var(--color-on-surface)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">school</span>
                  Información Académica
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Facultad <span className="text-[var(--color-error)]">*</span></label>
                  <select required value={facultyId} onChange={e => setFacultyId(e.target.value ? Number(e.target.value) : "")} className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold appearance-none cursor-pointer">
                    <option value="">Seleccionar Facultad</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Carrera <span className="text-[var(--color-error)]">*</span></label>
                  <select required disabled={!facultyId} value={careerId} onChange={e => setCareerId(e.target.value ? Number(e.target.value) : "")} className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold appearance-none cursor-pointer disabled:opacity-50">
                    <option value="">Seleccionar Carrera</option>
                    {careers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Año Académico <span className="text-[var(--color-error)]">*</span></label>
                  <select required disabled={!careerId} value={careerYearId} onChange={e => setCareerYearId(e.target.value ? Number(e.target.value) : "")} className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold appearance-none cursor-pointer disabled:opacity-50">
                    <option value="">Seleccionar Año</option>
                    {careerYears.map(y => (
                      <option key={y.id} value={y.id}>Año {y.year_number}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Aprovechamiento Docente</label>
                  <select value={academic_performance} onChange={e => setAcademicPerformance(e.target.value)} className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold appearance-none cursor-pointer">
                    <option value="">No Defindo</option>
                    <option value="Excelente">Excelente</option>
                    <option value="Bien">Bien</option>
                    <option value="Regular">Regular</option>
                    <option value="Mal">Mal</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Cuarto <span className="text-[var(--color-error)]">*</span></label>
                  <select
                    required
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value ? Number(e.target.value) : "")}
                    disabled={roomsLoading && roomOptions.length === 0}
                    className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">{roomsLoading ? "Cargando cuartos disponibles..." : "Seleccionar Cuarto"}</option>
                    {roomOptions.map((room) => (
                      <option key={room.id} value={room.id}>
                        {getRoomLabel(room)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-[var(--color-outline)] px-1">
                    {roomsLoading
                      ? "La lista se está cargando desde la API."
                      : "Solo se muestran cuartos activos y con disponibilidad."}
                  </p>
                  {shouldShowCurrentRoom && currentRoomSnapshot ? (
                    <p className="text-xs text-[var(--color-primary-dark)] px-1 font-semibold">
                      Cuarto actual: {getRoomLabel(currentRoomSnapshot)}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="mb-4 border-b border-[var(--color-outline-variant)]/40 pb-4">
                <h3 className="text-lg font-bold text-[var(--color-on-surface)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">health_and_safety</span>
                  Salud y Perfil Estudiantil
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Enfermedades que padece</label>
                  <textarea value={illnesses} onChange={e => setIllnesses(e.target.value)} className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal min-h-[100px]" placeholder="Ej. Asma, Hipertensión..."></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Medicamentos que consume</label>
                  <textarea value={medications} onChange={e => setMedications(e.target.value)} className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal min-h-[100px]" placeholder="Tratamientos actuales..."></textarea>
                </div>
              </div>
              
              <div className="max-w-md space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Proceso Disciplinario</label>
                <select value={disciplinary_process} onChange={e => setDisciplinaryProcess(e.target.value)} className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold appearance-none cursor-pointer">
                  <option value="">Ninguno</option>
                  <option value="Alerta Leve">Alerta Leve</option>
                  <option value="Sanción Grave">Sanción Grave</option>
                </select>
              </div>

              <div className="pt-4 mt-6 border-t border-[var(--color-outline-variant)]/20">
                <h4 className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-widest mb-6">Perfil Sociopolítico e Institucional</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* UJC */}
                  <label className={`group flex items-center justify-between p-4 bg-[var(--color-surface-container-high)] rounded-xl cursor-pointer hover:bg-[var(--color-surface-container-highest)] transition-colors ${is_militant ? '!bg-[var(--color-primary-selected)] ring-2 ring-[var(--color-primary)]/40' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--color-on-surface)]">Militante de la UJC/PCC</span>
                      <span className="text-[10px] text-[var(--color-outline)] uppercase">Organización Política</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={is_militant} onChange={e => setIsMilitant(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                    </div>
                  </label>
                  {/* MININT */}
                  <label className={`group flex items-center justify-between p-4 bg-[var(--color-surface-container-high)] rounded-xl cursor-pointer hover:bg-[var(--color-surface-container-highest)] transition-colors ${is_cadet_minint ? '!bg-[var(--color-primary-selected)] ring-2 ring-[var(--color-primary)]/40' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--color-on-surface)]">Cadete MININT</span>
                      <span className="text-[10px] text-[var(--color-outline)] uppercase">Min. del Interior</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={is_cadet_minint} onChange={e => setIsCadetMinint(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                    </div>
                  </label>
                  {/* FAR */}
                  <label className={`group flex items-center justify-between p-4 bg-[var(--color-surface-container-high)] rounded-xl cursor-pointer hover:bg-[var(--color-surface-container-highest)] transition-colors ${is_cadet_far ? '!bg-[var(--color-primary-selected)] ring-2 ring-[var(--color-primary)]/40' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--color-on-surface)]">Cadete FAR</span>
                      <span className="text-[10px] text-[var(--color-outline)] uppercase">Min. Fuerzas Armadas</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={is_cadet_far} onChange={e => setIsCadetFar(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                    </div>
                  </label>
                </div>
              </div>

              {!isEditing && (
                <div className="pt-8 mt-8 border-t border-[var(--color-outline-variant)]/20">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-[var(--color-primary)]">account_circle</span>
                    <h3 className="text-xl font-bold text-[var(--color-primary)]">Cuenta de Usuario</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-sm font-semibold text-[var(--color-on-surface-variant)]">Nombre de Usuario <span className="text-[var(--color-error)]">*</span></label>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-[var(--color-outline)] text-lg">person</span>
                        <input required value={username} onChange={e => setUsername(e.target.value)} type="text" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 pl-12 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="Ej. jperez"/>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-sm font-semibold text-[var(--color-on-surface-variant)]">Correo Electrónico <span className="text-[var(--color-error)]">*</span></label>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-[var(--color-outline)] text-lg">email</span>
                        <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 pl-12 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="Ej. jperez@uclv.cu"/>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2 max-w-[50%]">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-sm font-semibold text-[var(--color-on-surface-variant)]">Contraseña Provisional <span className="text-[var(--color-error)]">*</span></label>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-4 text-[var(--color-outline)] text-lg">key</span>
                        <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full bg-[var(--color-surface-container-high)] border-none rounded-lg p-3.5 pl-12 text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all font-bold placeholder:font-normal" placeholder="••••••••"/>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-[var(--color-surface-container-lowest)] border-t border-[var(--color-outline-variant)]/20 flex items-center justify-between mt-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard")}
            className="text-slate-500 hover:text-error hover:bg-error/10"
            type="button"
          >
            Cancelar y Salir
          </Button>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step - 1)}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Atrás
              </Button>
            )}
            
            {step < 3 ? (
              <Button 
                variant="default"
                onClick={() => {
                  if (step === 1) {
                    if (!first_name || !last_name || !ci || !gender) {
                      toast.warning("Faltan campos obligatorios", {
                        description: "Por favor, complete todos los campos marcados con (*) para continuar.",
                      });
                      return;
                    }
                    if (ci.length !== 11 || !/^\d+$/.test(ci)) {
                      toast.warning("Formato CI inválido", {
                        description: "El carné de identidad debe tener exactamente 11 dígitos.",
                      });
                      return;
                    }
                    if (phone && phone.length > 20) {
                      toast.warning("Teléfono muy largo", {
                        description: "El teléfono móvil no debe exceder los 20 caracteres.",
                      });
                      return;
                    }
                    if (emergency_phone && emergency_phone.length > 20) {
                      toast.warning("Teléfono muy largo", {
                        description: "El teléfono de contacto no debe exceder los 20 caracteres.",
                      });
                      return;
                    }
                  }
                  if (step === 2) {
                    if (!careerYearId) {
                      toast.warning("Faltan campos", {
                        description: "Debe seleccionar un año académico.",
                      });
                      return;
                    }
                  }
                  setStep(step + 1);
                }}
                type="button"
              >
                Siguiente Paso
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Button>
            ) : (
              <Button 
                variant="default"
                disabled={submissionStage !== "idle"}
                onClick={handleSubmit}
                type="button"
              >
                {submissionStage !== "idle" ? "Procesando..." : "Finalizar y Guardar"}
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <BottomSheet open={submissionStage !== "idle"} onClose={() => undefined} maxWidthClassName="max-w-sm">
        <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
          <div className="bg-[var(--color-primary-selected)] p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-container-lowest)] flex items-center justify-center shrink-0 shadow-[var(--shadow-primary-btn)]">
              <div className="w-6 h-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-[var(--color-primary-dark)] leading-tight">{submissionLabel}</h3>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                No cierres esta ventana mientras termina el proceso.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-[var(--color-surface-container-low)] p-4">
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">{submissionDetail}</p>
              <p className="mt-1 text-xs text-[var(--color-outline)] uppercase tracking-wider font-bold">
                {isEditing ? "Edición y reasignación" : "Creación y alojamiento"}
              </p>
            </div>
            <div className="h-2 rounded-full bg-[var(--color-surface-container-high)] overflow-hidden">
              <div className="h-full w-1/2 animate-pulse bg-[var(--color-primary)]" />
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}