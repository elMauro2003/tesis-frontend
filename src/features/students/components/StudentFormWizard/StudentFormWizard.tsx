"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  studentService 
} from "@/core/services/student.service";
import { 
  academicService 
} from "@/core/services/academic.service";
import { 
  StudentCreateRequest, 
  Student,
  Faculty,
  Career,
  AcademicYear as CareerYear,
  Group
} from "@/types/models";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StudentFormWizardProps {
  initialStudentId?: number;
}

export default function StudentFormWizard({ initialStudentId }: StudentFormWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(!!initialStudentId);
  const isEditing = !!initialStudentId;

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

  // Load Edit Data
  useEffect(() => {
    if (initialStudentId) {
      studentService.getStudentById(initialStudentId)
        .then(async (student) => {
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

          setFetchingInitial(false);
        })
        .catch((e) => {
          console.error(e);
          setFetchingInitial(false);
        });
    }
  }, [initialStudentId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: Partial<StudentCreateRequest> = {
        first_name,
        last_name,
        ci,
        student_id,
        gender,
        birth_date,
        province,
        municipality,
        address,
        phone,
        emergency_phone,
        group: Number(groupId),
        academic_performance,
        illnesses,
        medications,
        disciplinary_process,
        is_militant,
        is_cadet_minint,
        is_cadet_far,
      };

      if (!isEditing) {
        payload.username = username;
        payload.password = password;
        payload.email = email;
        await studentService.createStudent(payload as StudentCreateRequest);
      } else {
        if (email) payload.email = email;
        await studentService.updateStudent(initialStudentId!, payload);
      }

      toast.success(isEditing ? "Estudiante actualizado" : "Estudiante creado", {
        description: "La información se ha guardado correctamente.",
      });
      router.push("/dashboard");
    } catch (e: any) {
      console.error("Error submitting student", e);
      let errorMsg = "Verifique su conexión y los datos ingresados.";
      if (e.data?.error?.message) {
         errorMsg = e.data.error.message;
      } else if (e.data?.message) {
         errorMsg = e.data.message;
      } else if (e.status === 400) {
         errorMsg = "Existen errores de validación (Ej. Credenciales o Carné ya registrados).";
      } else if (e.status === 500) {
         errorMsg = "Ocurrió un error interno en el servidor. Puede que existan datos duplicados en el registro o campos corruptos.";
      }

      toast.error("Ocurrió un error al guardar", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Nombres <span className="text-red-500">*</span></label>
                  <input required value={first_name} onChange={e => setFirstName(e.target.value)} type="text" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Ej. Juan Carlos"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Apellidos <span className="text-red-500">*</span></label>
                  <input required value={last_name} onChange={e => setLastName(e.target.value)} type="text" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Ej. Pérez García"/>
                </div>

                {!isEditing && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Usuario <span className="text-red-500">*</span></label>
                      <input required value={username} onChange={e => setUsername(e.target.value)} type="text" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Ej. jperez"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Contraseña <span className="text-red-500">*</span></label>
                      <input required value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Constraseña"/>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Correo Electrónico <span className="text-red-500">*</span></label>
                  <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Ej. jperez@uclv.cu"/>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Carné de Identidad <span className="text-red-500">*</span></label>
                  <input required value={ci} onChange={e => setCi(e.target.value)} type="text" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Ej. 01051512345"/>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Matrícula (Expediente) <span className="text-red-500">*</span></label>
                  <input required value={student_id} onChange={e => setStudentId(e.target.value)} type="text" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Ej. E123456"/>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Fecha de Nacimiento <span className="text-red-500">*</span></label>
                  <input required value={birth_date} onChange={e => setBirthDate(e.target.value)} type="date" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Sexo <span className="text-red-500">*</span></label>
                  <select required value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white appearance-none">
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                {/* Optional items */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Provincia</label>
                  <input value={province} onChange={e => setProvince(e.target.value)} type="text" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Ej. Villa Clara"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Municipio</label>
                  <input value={municipality} onChange={e => setMunicipality(e.target.value)} type="text" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Ej. Santa Clara"/>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Dirección Particular</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} type="text" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Calle, Número, Reparto..."/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Teléfono Móvil</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="+53 51234567"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Teléfono de Contacto (Familiar)</label>
                  <input value={emergency_phone} onChange={e => setEmergencyPhone(e.target.value)} type="tel" className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white" placeholder="Ej. 42123456"/>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="mb-4 border-b border-surface-container pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">school</span>
                  Información Académica
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Facultad</label>
                  <select value={facultyId} onChange={e => setFacultyId(e.target.value ? Number(e.target.value) : "")} className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white appearance-none cursor-pointer">
                    <option value="">Seleccionar Facultad</option>
                    {faculties.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Carrera</label>
                  <select disabled={!facultyId} value={careerId} onChange={e => setCareerId(e.target.value ? Number(e.target.value) : "")} className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white appearance-none cursor-pointer disabled:opacity-50">
                    <option value="">Seleccionar Carrera</option>
                    {careers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Año Académico</label>
                  <select disabled={!careerId} value={careerYearId} onChange={e => setCareerYearId(e.target.value ? Number(e.target.value) : "")} className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white appearance-none cursor-pointer disabled:opacity-50">
                    <option value="">Seleccionar Año</option>
                    {careerYears.map(y => (
                      <option key={y.id} value={y.id}>Año {y.year_number}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Grupo <span className="text-red-500">*</span></label>
                  <select required disabled={!careerYearId} value={groupId} onChange={e => setGroupId(e.target.value ? Number(e.target.value) : "")} className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white appearance-none cursor-pointer disabled:opacity-50">
                    <option value="">Seleccionar Grupo</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Aprovechamiento Docente</label>
                  <select value={academic_performance} onChange={e => setAcademicPerformance(e.target.value)} className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white appearance-none cursor-pointer">
                    <option value="">No Defindo</option>
                    <option value="Excelente">Excelente</option>
                    <option value="Bien">Bien</option>
                    <option value="Regular">Regular</option>
                    <option value="Mal">Mal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="mb-4 border-b border-surface-container pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">health_and_safety</span>
                  Salud y Perfil Estudiantil
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Enfermedades que padece</label>
                  <textarea value={illnesses} onChange={e => setIllnesses(e.target.value)} className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white min-h-[100px]" placeholder="Ej. Asma, Hipertensión..."></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Medicamentos que consume</label>
                  <textarea value={medications} onChange={e => setMedications(e.target.value)} className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white min-h-[100px]" placeholder="Tratamientos actuales..."></textarea>
                </div>
              </div>
              
              <div className="max-w-md space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-1">Proceso Disciplinario</label>
                <select value={disciplinary_process} onChange={e => setDisciplinaryProcess(e.target.value)} className="w-full bg-slate-50 border-none rounded-lg p-3.5 text-slate-900 focus:ring-2 focus:ring-primary/40 focus:bg-white appearance-none">
                  <option value="">Ninguno</option>
                  <option value="Alerta Leve">Alerta Leve</option>
                  <option value="Sanción Grave">Sanción Grave</option>
                </select>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Perfil Sociopolítico e Institucional</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* UJC */}
                  <label className={`group flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors ${is_militant ? '!bg-blue-50 ring-2 ring-primary/20' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">Militante de la UJC/PCC</span>
                      <span className="text-[10px] text-slate-500 uppercase">Organización Política</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={is_militant} onChange={e => setIsMilitant(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </label>
                  {/* MININT */}
                  <label className={`group flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors ${is_cadet_minint ? '!bg-blue-50 ring-2 ring-primary/20' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">Cadete MININT</span>
                      <span className="text-[10px] text-slate-500 uppercase">Min. del Interior</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={is_cadet_minint} onChange={e => setIsCadetMinint(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </label>
                  {/* FAR */}
                  <label className={`group flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors ${is_cadet_far ? '!bg-blue-50 ring-2 ring-primary/20' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">Cadete FAR</span>
                      <span className="text-[10px] text-slate-500 uppercase">Min. Fuerzas Armadas</span>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={is_cadet_far} onChange={e => setIsCadetFar(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </label>
                </div>
              </div>
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
                    if (!first_name || !last_name || !ci || !student_id || !birth_date || !gender || (!isEditing && (!username || !password || !email))) {
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
                    if (student_id.length > 20) {
                       toast.warning("Matrícula muy larga", {
                        description: "La matrícula no puede exceder los 20 caracteres.",
                      });
                      return;
                    }
                    if (!isEditing) {
                      if (!/^[\w.@+-]+$/.test(username)) {
                        toast.warning("Formato de usuario inválido", {
                          description: "Solo letras, números y los caracteres @/./+/-/_",
                        });
                        return;
                      }
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        toast.warning("Correo inválido", {
                          description: "Inserte un formato de correo electrónico válido.",
                        });
                        return;
                      }
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
                    if (!groupId) {
                      toast.warning("Grupo no seleccionado", {
                        description: "Debe seleccionar un grupo al cual asignar el estudiante.",
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
                disabled={loading}
                onClick={handleSubmit}
                type="button"
              >
                {loading ? "Guardando..." : "Finalizar y Guardar"}
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}