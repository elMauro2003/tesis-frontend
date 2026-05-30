"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { cubaProvinces, getMunicipalitiesByProvince } from "@/constants/cubaGeography";
import { FetchError } from "@/lib/fetchClient";
import { 
  StudentCreateRequest, 
  Student,
  Faculty,
  Career,
  AcademicYear as CareerYear,
  Site,
  Building,
  Wing,
  Room
} from "@/types/models";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

const getRoomWingId = (room: Room) => {
  if (room.wing && typeof room.wing === "object") {
    return typeof room.wing.id === "number" ? room.wing.id : null;
  }
  return typeof room.wing === "number" ? room.wing : null;
};

const getRoomBuilding = (room: Room) => {
  if (!room.wing || typeof room.wing !== "object") return null;
  const building = room.wing.building;
  if (building && typeof building === "object") return building;
  return null;
};

const getRoomSite = (room: Room) => {
  const building = getRoomBuilding(room);
  if (!building) return null;
  const site = building.site;
  if (site && typeof site === "object") return site;
  return null;
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");
const DEFAULT_STUDENT_GROUP_ID = 1;

const toRoman = (num?: number | null) => {
  if (!num || num <= 0) return String(num ?? "");
  const romans: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = Math.floor(Number(num));
  let res = "";
  for (const [value, roman] of romans) {
    while (n >= value) {
      res += roman;
      n -= value;
    }
  }
  return res;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveCreatedStudentId = async (createdStudent: Student | (Partial<StudentCreateRequest> & { id?: number }), fallbackUsername?: string, fallbackCi?: string) => {
  if (typeof createdStudent.id === "number") {
    return createdStudent.id;
  }

  const searchTerms = [fallbackCi, fallbackUsername].filter((term): term is string => !!term && term.trim().length > 0);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    for (const term of searchTerms) {
      const response = await studentService.getStudents({ search: term, page: 1, page_size: 20 });
      const exactMatch = response.results.find((student) => {
        const candidateUsername = student.user && typeof student.user === "object" && "username" in student.user
          ? String((student.user as { username?: string }).username ?? "")
          : undefined;
        return student.ci === term || student.student_id === term || candidateUsername === term;
      });

      if (exactMatch?.id) {
        return exactMatch.id;
      }
    }

    await sleep(250);
  }

  return null;
};

export default function StudentFormWizard({ initialStudentId }: StudentFormWizardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
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
  const [ci, setCi] = useState("");
  const [student_id, setStudentId] = useState("");
  const [gender, setGender] = useState("");
  const [birth_date, setBirthDate] = useState("");
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [emergency_phone, setEmergencyPhone] = useState("");
  // Refs and helpers for focusing fields from validation modal
  const focusField = (key: string) => {
    const goToStepAndFocus = (s: number, selector: string, click = false) => {
      setStep(s);
      // Wait a tick for DOM to update
      setTimeout(() => {
        const el = document.getElementById(selector) as HTMLElement | null;
        if (el) {
          if (click) el.click();
          try { el.focus(); } catch {}
        } else {
          // try querySelector by name
          const el2 = document.querySelector(`[name="${selector}"]`) as HTMLElement | null;
          if (el2) {
            if (click) (el2 as HTMLElement).click();
            try { el2.focus(); } catch {}
          }
        }
      }, 120);
    };

    const map: Record<string, () => void> = {
      first_name: () => goToStepAndFocus(1, 'first_name'),
      last_name: () => goToStepAndFocus(1, 'last_name'),
      ci: () => goToStepAndFocus(1, 'ci'),
      address: () => goToStepAndFocus(1, 'address'),
      phone: () => goToStepAndFocus(1, 'phone'),
      emergency_phone: () => goToStepAndFocus(1, 'emergency_phone'),
      username: () => goToStepAndFocus(3, 'username'),
      password: () => goToStepAndFocus(3, 'password'),
      faculty: () => goToStepAndFocus(2, 'faculty_select', true),
      career: () => goToStepAndFocus(2, 'career_select', true),
      year: () => goToStepAndFocus(2, 'career_year_select', true),
      group: () => goToStepAndFocus(2, 'room_select', true),
      room: () => goToStepAndFocus(2, 'room_select', true),
    };

    const action = map[key] || (() => {
      // fallback: try to focus element with id equal to key
      goToStepAndFocus(1, key);
    });

    action();
    // close modal after focusing attempt
    setValidationErrors(null);
  };

  // Step 2 State
  const [facultyId, setFacultyId] = useState<number | "">("");
  const [careerId, setCareerId] = useState<number | "">("");
  const [careerYearId, setCareerYearId] = useState<number | "">("");
  const [academic_performance, setAcademicPerformance] = useState("");

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [careerYears, setCareerYears] = useState<CareerYear[]>([]);
  const [careersLoading, setCareersLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [wings, setWings] = useState<Wing[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [buildingsLoading, setBuildingsLoading] = useState(false);
  const [wingsLoading, setWingsLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | "">("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | "">("");
  const [selectedWingId, setSelectedWingId] = useState<number | "">("");
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
  const [validationErrors, setValidationErrors] = useState<{ key: string; message: string }[] | null>(null);

  const provinceOptions = useMemo(() => {
    if (!province) {
      return cubaProvinces;
    }

    const selectedProvinceExists = cubaProvinces.some((item) => item.value === province);
    if (selectedProvinceExists) {
      return cubaProvinces;
    }

    return [
      { value: province, label: province, municipalities: [] },
      ...cubaProvinces,
    ];
  }, [province]);

  const municipalityOptions = useMemo(() => {
    const options = getMunicipalitiesByProvince(province);
    if (!municipality) {
      return options;
    }

    return options.includes(municipality) ? options : [municipality, ...options];
  }, [province, municipality]);

  // Fetch initial academic data
  useEffect(() => {
    academicService.getFaculties().then(res => setFaculties(res.results)).catch(console.error);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setSitesLoading(true);
    infrastructureService.getSites()
      .then((response) => {
        if (!cancelled) {
          setSites(response.results);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("No se pudieron cargar las sedes", {
          description: "Revise la conexión con la API e inténtelo nuevamente.",
        });
      })
      .finally(() => {
        if (!cancelled) {
          setSitesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (facultyId) {
      let cancelled = false;
      setCareersLoading(true);

      academicService.getCareers(Number(facultyId))
        .then(res => {
          if (!cancelled) {
            setCareers(res.results);
          }
        })
        .catch(console.error)
        .finally(() => {
          if (!cancelled) {
            setCareersLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
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
    if (!selectedSiteId) {
      setBuildings([]);
      setWings([]);
      setRooms([]);
      return;
    }

    let cancelled = false;
    setBuildingsLoading(true);

    infrastructureService.getBuildings(Number(selectedSiteId))
      .then((response) => {
        if (!cancelled) {
          setBuildings(response.results);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("No se pudieron cargar los edificios", {
          description: "Seleccione otra sede o intente nuevamente.",
        });
      })
      .finally(() => {
        if (!cancelled) {
          setBuildingsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSiteId]);

  useEffect(() => {
    if (!selectedBuildingId) {
      setWings([]);
      setRooms([]);
      return;
    }

    let cancelled = false;
    setWingsLoading(true);

    infrastructureService.getWings(Number(selectedBuildingId))
      .then((response) => {
        if (!cancelled) {
          setWings(response.results);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("No se pudieron cargar las alas", {
          description: "Seleccione otro edificio o intente nuevamente.",
        });
      })
      .finally(() => {
        if (!cancelled) {
          setWingsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedBuildingId]);

  useEffect(() => {
    if (!selectedWingId) {
      setRooms([]);
      return;
    }

    let cancelled = false;
    setRoomsLoading(true);
    setRooms([]);

    infrastructureService.getAllRooms({ wing: Number(selectedWingId), is_active: true })
      .then((response) => {
        if (!cancelled) {
          setRooms(response.results.filter(isRoomSelectable));
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("No se pudieron cargar los cuartos", {
          description: "Revise la conexión o la disponibilidad del edificio y el ala seleccionados.",
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
  }, [selectedWingId]);

  useEffect(() => {
    if (!province) {
      if (municipality) {
        setMunicipality("");
      }
      return;
    }

    const provinceMunicipalities = getMunicipalitiesByProvince(province);
    if (municipality && !provinceMunicipalities.includes(municipality)) {
      setMunicipality("");
    }
  }, [province]);

  // Load Edit Data
  useEffect(() => {
    if (initialStudentId) {
      studentService.getStudentById(initialStudentId)
        .then(async (student) => {
          setPersistedStudentId(initialStudentId);
          setFirstName(student.user && typeof student.user === 'object' ? student.user.first_name || "" : student.first_name || "");
          setLastName(student.user && typeof student.user === 'object' ? student.user.last_name || "" : student.last_name || "");
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

          setAcademicPerformance(student.academic_performance || "");
          
          setIllnesses(student.illnesses || "");
          setMedications(student.medications || "");
          setDisciplinaryProcess(student.disciplinary_process || "");
          setIsMilitant(!!student.is_militant);
          setIsCadetMinint(!!student.is_cadet_minint);
          setIsCadetFar(!!student.is_cadet_far);

          const hydrateAcademicSelection = async () => {
            let resolvedCareerYearId: number | null = null;
            let resolvedCareerId: number | null = null;
            let resolvedFacultyId: number | null = null;

            const detailCareerYear = student.group_detail?.career_year_detail;
            if (detailCareerYear?.id) {
              resolvedCareerYearId = Number(detailCareerYear.id);
            }

            if (detailCareerYear?.career) {
              resolvedCareerId = Number(detailCareerYear.career);
            }

            const groupCareerYear = student.group && typeof student.group === "object"
              ? student.group.career_year
              : null;

            if (!resolvedCareerYearId && typeof groupCareerYear === "number") {
              resolvedCareerYearId = groupCareerYear;
            }

            if (!resolvedCareerYearId && groupCareerYear && typeof groupCareerYear === "object" && "id" in groupCareerYear) {
              const maybeId = Number((groupCareerYear as { id?: number }).id);
              if (!Number.isNaN(maybeId) && maybeId > 0) {
                resolvedCareerYearId = maybeId;
              }
            }

            if (!resolvedCareerId && groupCareerYear && typeof groupCareerYear === "object") {
              const careerValue = (groupCareerYear as { career?: number | { id?: number } }).career;
              if (typeof careerValue === "number") {
                resolvedCareerId = careerValue;
              } else if (careerValue && typeof careerValue === "object" && typeof careerValue.id === "number") {
                resolvedCareerId = careerValue.id;
              }
            }

            if (!resolvedCareerId && resolvedCareerYearId) {
              try {
                const academicYear = await academicService.getAcademicYearById(resolvedCareerYearId);
                if (typeof academicYear.career === "number") {
                  resolvedCareerId = academicYear.career;
                } else if (academicYear.career && typeof academicYear.career === "object" && typeof academicYear.career.id === "number") {
                  resolvedCareerId = academicYear.career.id;
                }
              } catch (error) {
                console.error("No se pudo resolver la carrera desde el año académico", error);
              }
            }

            if (resolvedCareerId) {
              try {
                const career = await academicService.getCareerById(resolvedCareerId);
                if (typeof career.faculty === "number") {
                  resolvedFacultyId = career.faculty;
                } else if (career.faculty && typeof career.faculty === "object" && typeof career.faculty.id === "number") {
                  resolvedFacultyId = career.faculty.id;
                }
              } catch (error) {
                console.error("No se pudo resolver la facultad desde la carrera", error);
              }
            }

            if (resolvedFacultyId) {
              setFacultyId(resolvedFacultyId);
            }
            if (resolvedCareerId) {
              setCareerId(resolvedCareerId);
            }
            if (resolvedCareerYearId) {
              setCareerYearId(resolvedCareerYearId);
            }
          };

          await hydrateAcademicSelection();

          const roomIdFromStudent = getRoomIdFromStudent(student);

          if (roomIdFromStudent) {
            setCurrentRoomId(roomIdFromStudent);
            setSelectedRoomId(roomIdFromStudent);
          }

          const hydrateLocationFromRoomId = async (roomId: number) => {
            const room = await infrastructureService.getRoomById(roomId);

            let wingObject: Wing | null = room.wing && typeof room.wing === "object"
              ? (room.wing as Wing)
              : null;

            if (!wingObject && typeof room.wing === "number") {
              wingObject = await infrastructureService.getWingById(room.wing);
            }

            let buildingObject: Building | null = wingObject && wingObject.building && typeof wingObject.building === "object"
              ? (wingObject.building as Building)
              : null;

            if (!buildingObject && wingObject && typeof wingObject.building === "number") {
              buildingObject = await infrastructureService.getBuildingById(wingObject.building);
            }

            let siteObject: Site | null = buildingObject && buildingObject.site && typeof buildingObject.site === "object"
              ? (buildingObject.site as Site)
              : null;

            if (!siteObject && buildingObject && typeof buildingObject.site === "number") {
              siteObject = await infrastructureService.getSiteById(buildingObject.site);
            }

            const normalizedBuilding: Building | null = buildingObject
              ? { ...buildingObject, site: siteObject ?? buildingObject.site }
              : null;
            const normalizedWing: Wing | null = wingObject
              ? { ...wingObject, building: normalizedBuilding ?? wingObject.building }
              : null;
            const normalizedRoom: Room = normalizedWing
              ? { ...room, wing: normalizedWing }
              : room;

            setCurrentRoomId(normalizedRoom.id);
            setCurrentRoomSnapshot(normalizedRoom);
            setSelectedRoomId(normalizedRoom.id);

            if (siteObject?.id) {
              setSelectedSiteId(siteObject.id);
            }
            if (normalizedBuilding?.id) {
              setSelectedBuildingId(normalizedBuilding.id);
            }
            if (normalizedWing?.id) {
              setSelectedWingId(normalizedWing.id);
            }
          };

          try {
            if (student.current_room_info?.assignment_id) {
              setCurrentAssignmentId(student.current_room_info.assignment_id);
            }

            const assignmentResponse = roomIdFromStudent
              ? null
              : await accommodationService.getAssignments({ student: initialStudentId, is_active: true, page: 1 });

            if (roomIdFromStudent) {
              await hydrateLocationFromRoomId(roomIdFromStudent);
            } else {
              let resolvedRoomId: number | null = null;

              const currentRoom = await studentService.getStudentCurrentRoom(initialStudentId);
              setCurrentRoomId(currentRoom.id);
              setCurrentRoomSnapshot(currentRoom);
              setSelectedRoomId((previousRoomId) => previousRoomId || currentRoom.id);
              resolvedRoomId = currentRoom.id;

              if (!student.current_room_info?.assignment_id && assignmentResponse && assignmentResponse.results.length > 0) {
                setCurrentAssignmentId(assignmentResponse.results[0].id);
              }

              if (resolvedRoomId) {
                await hydrateLocationFromRoomId(resolvedRoomId);
              }
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

  useEffect(() => {
    if (!currentRoomSnapshot) return;

    const wing = currentRoomSnapshot.wing && typeof currentRoomSnapshot.wing === 'object' ? currentRoomSnapshot.wing : null;
    const building = wing?.building && typeof wing.building === 'object' ? wing.building : null;
    const site = building?.site && typeof building.site === 'object' ? building.site : null;

    if (site?.id) setSelectedSiteId(site.id);
    if (building?.id) setSelectedBuildingId(building.id);
    if (wing?.id) setSelectedWingId(wing.id);
    if (currentRoomSnapshot.id) setSelectedRoomId(currentRoomSnapshot.id);
  }, [currentRoomSnapshot]);

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
  const hasAnyLocationSelection = Boolean(selectedSiteId || selectedBuildingId || selectedWingId || selectedRoomId !== "");
  const hasCompleteLocationSelection = Boolean(selectedSiteId && selectedBuildingId && selectedWingId && selectedRoomId !== "");

  const locationLabels = useMemo(() => {
    const siteLabel = selectedSiteId && sites.find((site) => site.id === selectedSiteId)?.name ? sites.find((site) => site.id === selectedSiteId)?.name : null;
    const buildingLabel = selectedBuildingId && buildings.find((building) => building.id === selectedBuildingId)?.name ? buildings.find((building) => building.id === selectedBuildingId)?.name : null;
    const wingLabel = selectedWingId && wings.find((wing) => wing.id === selectedWingId)?.name ? wings.find((wing) => wing.id === selectedWingId)?.name : null;

    return { siteLabel, buildingLabel, wingLabel };
  }, [selectedSiteId, selectedBuildingId, selectedWingId, sites, buildings, wings]);

  const selectedRoomSummary = selectedRoomId
    ? roomOptions.find((room) => room.id === selectedRoomId) ?? currentRoomSnapshot
    : currentRoomSnapshot;

  const handleSiteChange = (value: string) => {
    const nextSiteId = value ? Number(value) : "";
    setSelectedSiteId(nextSiteId);
    setSelectedBuildingId("");
    setSelectedWingId("");
    setSelectedRoomId("");
    setBuildings([]);
    setWings([]);
    setRooms([]);
  };

  const handleBuildingChange = (value: string) => {
    const nextBuildingId = value ? Number(value) : "";
    setSelectedBuildingId(nextBuildingId);
    setSelectedWingId("");
    setSelectedRoomId("");
    setWings([]);
    setRooms([]);
  };

  const handleWingChange = (value: string) => {
    const nextWingId = value ? Number(value) : "";
    setSelectedWingId(nextWingId);
    setSelectedRoomId("");
    setRooms([]);
  };

  const locationPath = [locationLabels.siteLabel, locationLabels.buildingLabel, locationLabels.wingLabel].filter(Boolean).join(" · ");
  const locationRoomLabel = selectedRoomSummary ? `Cuarto ${selectedRoomSummary.number}` : "";
  const locationSummaryText = locationPath || locationRoomLabel
    ? `Ubicación elegida: ${locationPath}${locationPath && locationRoomLabel ? " · " : ""}${locationRoomLabel}`
    : "Ubicación opcional";

  const collectValidationIssues = (
    value: unknown,
    path: string[] = [],
    issues: { key: string; message: string }[] = []
  ): { key: string; message: string }[] => {
    if (typeof value === "string") {
      const message = value.trim();
      if (message) {
        issues.push({ key: path[path.length - 1] || "general", message });
      }
      return issues;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (typeof item === "string") {
          const message = item.trim();
          if (message) {
            issues.push({ key: path.join(".") || "general", message });
          }
        } else if (item && typeof item === "object") {
          collectValidationIssues(item, path, issues);
        }
      });

      return issues;
    }

    if (!value || typeof value !== "object") {
      return issues;
    }

    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      const nextPath = [...path, key];

      if (typeof nestedValue === "string") {
        const message = nestedValue.trim();
        if (message) {
          issues.push({ key: nextPath.join("."), message });
        }
        continue;
      }

      if (Array.isArray(nestedValue)) {
        nestedValue.forEach((item) => {
          if (typeof item === "string") {
            const message = item.trim();
            if (message) {
              issues.push({ key: nextPath.join("."), message });
            }
          } else if (item && typeof item === "object") {
            collectValidationIssues(item, nextPath, issues);
          }
        });
        continue;
      }

      if (nestedValue && typeof nestedValue === "object") {
        collectValidationIssues(nestedValue, nextPath, issues);
      }
    }

    return issues;
  };

  const createOrUpdateStudent = async () => {
    // Validate that selected careerYear belongs to selected career
    if (careerId && careerYearId) {
      const matched = careerYears.some((y) => Number(y.id) === Number(careerYearId));
      if (!matched) {
        const msg = `El año académico seleccionado no pertenece a la carrera elegida. Seleccione un año válido para la carrera.`;
        setValidationErrors([{ key: "year", message: msg }]);
        throw new Error(msg);
      }
    }

    // Determine numeric year to send (year_number) from selected careerYearId
    const selectedCareerYear = careerYears.find((y) => Number(y.id) === Number(careerYearId));
    const yearToSend = selectedCareerYear ? (selectedCareerYear.year_number ?? selectedCareerYear.year) : (careerYearId ? Number(careerYearId) : undefined);

    const payload: Partial<StudentCreateRequest> = {
      first_name,
      last_name,
      ci,
      student_id: ci,
      gender,
      birth_date: birth_date || extractBirthDate(ci),
      career: Number(careerId),
      year: yearToSend !== undefined ? Number(yearToSend) : undefined,
      group: DEFAULT_STUDENT_GROUP_ID,
      province,
      municipality,
      address,
      phone,
      emergency_phone,
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
      setSubmissionStage("saving-student");
      const createdStudent = await studentService.createStudent(payload as StudentCreateRequest);
      const resolvedStudentId = await resolveCreatedStudentId(createdStudent, username, ci);

      if (!resolvedStudentId) {
        throw new Error("No se pudo recuperar el identificador del estudiante recién creado para asignarle cuarto.");
      }

      setPersistedStudentId(resolvedStudentId);
      return resolvedStudentId;
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
    const previousAssignmentId = currentAssignmentId;
    const previousRoomId = currentRoomId;

    try {
      let roomChanged = false;

      if (isEditing && currentAssignmentId && roomHasChanged) {
        setSubmissionStage("releasing-room");
        await accommodationService.releaseAssignment(currentAssignmentId);
        setCurrentAssignmentId(null);
        roomChanged = true;
      }

      if (!isEditing || roomHasChanged || currentRoomId === null) {
        setSubmissionStage("assigning-room");
        const assignment = await accommodationService.createAssignment({
          student: studentId,
          room: roomId,
          assigned_date: new Date().toISOString().slice(0, 10),
        });

        setCurrentRoomId(roomId);
        setCurrentAssignmentId(assignment.id ?? null);
        roomChanged = true;
      }

      return roomChanged;
    } catch (roomError) {
      if (isEditing && roomHasChanged && previousAssignmentId && previousRoomId !== null) {
        try {
          const restoredAssignment = await accommodationService.createAssignment({
            student: studentId,
            room: previousRoomId,
            assigned_date: new Date().toISOString().slice(0, 10),
          });
          setCurrentRoomId(previousRoomId);
          setCurrentAssignmentId(restoredAssignment.id ?? previousAssignmentId);
        } catch (rollbackError) {
          console.error("No se pudo restaurar el cuarto anterior", rollbackError);
        }
      }

      throw roomError;
    }
  };

  const handleSubmit = async () => {
    if (!isEditing && !persistedStudentId) {
      if (!username || !password) {
        toast.warning("Faltan datos de cuenta", { description: "Por favor, complete usuario y contraseña para continuar." });
        return;
      }
      if (!/^[\w.@+-]+$/.test(username)) {
        toast.warning("Formato de usuario inválido", { description: "Solo letras, números y los caracteres @/./+/-/_" });
        return;
      }
    }

    if (hasAnyLocationSelection && !hasCompleteLocationSelection) {
      const missingLocationFields: string[] = [];
      if (!selectedSiteId) missingLocationFields.push("Sede");
      if (!selectedBuildingId) missingLocationFields.push("Edificio");
      if (!selectedWingId) missingLocationFields.push("Ala");
      if (selectedRoomId === "") missingLocationFields.push("Cuarto");

      toast.warning("Ubicación incompleta", {
        description: `Puede guardar sin ubicación o completar: ${missingLocationFields.join(", ")}.`,
      });
      return;
    }

    setValidationErrors(null);

    let createdStudentId: number | null = null;
    const isCreateFlow = !isEditing && !persistedStudentId;

    try {
      const studentId = await createOrUpdateStudent();
      createdStudentId = studentId ?? null;

      const shouldAssignRoom = hasCompleteLocationSelection;
      let roomAssigned = false;

      if (studentId && shouldAssignRoom) {
        roomAssigned = await assignRoomToStudent(studentId);
      }

      toast.success(isEditing ? "Estudiante actualizado" : "Estudiante creado", {
        description: shouldAssignRoom
          ? "La información y la asignación de cuarto se completaron correctamente."
          : "La información se guardó correctamente. Podrá asignar un cuarto más adelante desde Cuartos.",
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["students-all"] }),
        queryClient.invalidateQueries({ queryKey: ["students-visible-details"] }),
        queryClient.invalidateQueries({ queryKey: ["student-suggestions"] }),
        queryClient.invalidateQueries({ queryKey: ["students"] }),
        ...(roomAssigned ? [queryClient.invalidateQueries({ queryKey: ["active-assignments"] })] : []),
      ]);

      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting student", error);

      if (createdStudentId && isCreateFlow) {
        try {
          await studentService.deleteStudent(createdStudentId);
        } catch (rollbackError) {
          console.error("No se pudo eliminar el estudiante creado tras fallar la asignación", rollbackError);
        }
      }

      // Default message
      let title = "Ocurrió un error al guardar";
      let description = "Verifique su conexión y los datos ingresados.";
      let shouldShowValidationModal = false;

      // If FetchError from fetchClient, extract structured info
      if (error instanceof FetchError) {
        const fe = error as FetchError;
        if (fe.status === 401) {
          title = "Autenticación requerida";
          description = "No se pudo verificar su sesión. Inicie sesión nuevamente.";
        } else if (fe.status === 400 && fe.data) {
          const details = (fe.data?.error && fe.data.error.details) || fe.data?.details || fe.data;
          const items = collectValidationIssues(details);
          const normalizedItems = items.map((item) => {
            const keyLower = item.key.toLowerCase();
            const messageLower = item.message.toLowerCase();
            const mentionsUsername = keyLower.includes("username") || messageLower.includes("username") || messageLower.includes("nombre de usuario");
            const isTakenMessage =
              messageLower.includes("taken") ||
              messageLower.includes("ya existe") ||
              messageLower.includes("existe") ||
              messageLower.includes("disponible") ||
              messageLower.includes("unique") ||
              messageLower.includes("unico") ||
              messageLower.includes("único") ||
              messageLower.includes("duplic");

            if (mentionsUsername && isTakenMessage) {
              return { key: "username", message: "El username ya está tomado" };
            }

            return item;
          });

          if (normalizedItems.length > 0) {
            title = "Errores de validación";
            description = normalizedItems.map((item) => `${item.key}: ${item.message}`).join("; ");
            setValidationErrors(normalizedItems);
            shouldShowValidationModal = true;
          } else {
            title = "Datos inválidos";
            description = fe.message || "No se pudo guardar el estudiante porque hay campos con información inválida. Revise los datos e inténtelo nuevamente.";
          }
        } else if (fe.status >= 500) {
          title = "Error del servidor";
          description = fe.message || "Ocurrió un error interno en el servidor.";
        } else if (fe.message) {
          description = fe.message;
        }
      } else if (error instanceof Error && error.message) {
        description = error.message;
      }

      // If validationErrors set, show modal instead of toast
      if (!shouldShowValidationModal) {
        toast.error(title, { description });
      }
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
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Nombres <span className="text-[var(--color-error)]">*</span></label>
                  <Input id="first_name" required value={first_name} onChange={e => setFirstName(e.target.value)} type="text" placeholder="Ej. Juan Carlos" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Apellidos <span className="text-[var(--color-error)]">*</span></label>
                  <Input id="last_name" required value={last_name} onChange={e => setLastName(e.target.value)} type="text" placeholder="Ej. Pérez García" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Carné de Identidad <span className="text-[var(--color-error)]">*</span></label>
                  <Input id="ci" required value={ci} onChange={e => setCi(digitsOnly(e.target.value))} type="text" inputMode="numeric" pattern="[0-9]*" placeholder="Ej. 01051512345" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Sexo <span className="text-[var(--color-error)]">*</span></label>
                  <Select required value={gender} onValueChange={setGender}>
                    <SelectTrigger className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Provincia</label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                      <SelectValue placeholder="Seleccionar Provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinceOptions.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Municipio</label>
                  <Select value={municipality} onValueChange={setMunicipality} disabled={!province}>
                    <SelectTrigger className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                      <SelectValue placeholder={province ? "Seleccionar Municipio" : "Selecciona primero una provincia"} />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalityOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Dirección Particular</label>
                  <Input id="address" value={address} onChange={e => setAddress(e.target.value)} type="text" placeholder="Calle, Número, Reparto..." />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Teléfono Móvil</label>
                  <Input id="phone" value={phone} onChange={e => setPhone(digitsOnly(e.target.value))} type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="Ej. 51234567" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Teléfono de Contacto (Familiar)</label>
                  <Input id="emergency_phone" value={emergency_phone} onChange={e => setEmergencyPhone(digitsOnly(e.target.value))} type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="Ej. 42123456" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="rounded-3xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)] overflow-hidden">
                <div className="p-6 flex items-start gap-4 bg-[var(--color-surface-container-low)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-primary-selected)] flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-[var(--color-primary-dark)]">Información Académica</h4>
                    <p className="mt-1 text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                      Completa los datos académicos en el orden correcto para mantener la relación entre facultad, carrera y año.
                    </p>
                  </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Facultad <span className="text-[var(--color-error)]">*</span></label>
                    <Select required value={facultyId === "" ? "" : String(facultyId)} onValueChange={(value) => setFacultyId(value ? Number(value) : "")}>
                      <SelectTrigger id="faculty_select" className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                        <SelectValue placeholder="Seleccionar Facultad" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Aprovechamiento Docente</label>
                    <Select value={academic_performance} onValueChange={setAcademicPerformance}>
                      <SelectTrigger className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                        <SelectValue placeholder="No definido" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excelente">Excelente</SelectItem>
                        <SelectItem value="Bien">Bien</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Mal">Mal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Carrera <span className="text-[var(--color-error)]">*</span></label>
                    <Select required disabled={!facultyId} value={careerId === "" ? "" : String(careerId)} onValueChange={(value) => setCareerId(value ? Number(value) : "")}>
                      <SelectTrigger id="career_select" className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                        <SelectValue placeholder={!facultyId ? "Seleccione primero una facultad" : careersLoading ? "Cargando carreras..." : "Seleccionar Carrera"} />
                      </SelectTrigger>
                      <SelectContent>
                        {careers.map((career) => (
                          <SelectItem key={career.id} value={String(career.id)}>{career.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Año Académico <span className="text-[var(--color-error)]">*</span></label>
                    <Select required disabled={!careerId} value={careerYearId === "" ? "" : String(careerYearId)} onValueChange={(value) => setCareerYearId(value ? Number(value) : "")}>
                      <SelectTrigger id="career_year_select" className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                        <SelectValue placeholder="Seleccionar Año" />
                      </SelectTrigger>
                      <SelectContent>
                        {careerYears.map((y) => (
                          <SelectItem key={y.id} value={String(y.id)}>{`Año ${toRoman(y.year_number ?? y.year)}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)] overflow-hidden">
                <div className="p-6 flex items-start gap-4 bg-[var(--color-surface-container-low)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-primary-selected)] flex items-center justify-center shrink-0 text-[var(--color-primary)]">
                    <span className="material-symbols-outlined">home</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-[var(--color-primary-dark)]">Ubicación</h4>
                    <p className="mt-1 text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                      Esta asignación es opcional por ahora. Si no eliges un cuarto, podrás hacerlo después desde la sección de Cuartos.
                    </p>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Sede</label>
                      <Select value={selectedSiteId === "" ? "" : String(selectedSiteId)} onValueChange={handleSiteChange}>
                        <SelectTrigger id="site_select" className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                          <SelectValue placeholder={sitesLoading ? "Cargando sedes..." : "Seleccionar Sede"} />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Edificio</label>
                      <Select disabled={!selectedSiteId || buildingsLoading || buildings.length === 0} value={selectedBuildingId === "" ? "" : String(selectedBuildingId)} onValueChange={handleBuildingChange}>
                        <SelectTrigger id="building_select" className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                          <SelectValue placeholder={!selectedSiteId ? "Seleccione primero una sede" : buildingsLoading ? "Cargando edificios..." : "Seleccionar Edificio"} />
                        </SelectTrigger>
                        <SelectContent>
                          {buildings.map((building) => (
                            <SelectItem key={building.id} value={String(building.id)}>{building.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Ala</label>
                      <Select disabled={!selectedBuildingId || wingsLoading || wings.length === 0} value={selectedWingId === "" ? "" : String(selectedWingId)} onValueChange={handleWingChange}>
                        <SelectTrigger id="wing_select" className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                          <SelectValue placeholder={!selectedBuildingId ? "Seleccione primero un edificio" : wingsLoading ? "Cargando alas..." : "Seleccionar Ala"} />
                        </SelectTrigger>
                        <SelectContent>
                          {wings.map((wing) => (
                            <SelectItem key={wing.id} value={String(wing.id)}>{wing.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Cuarto</label>
                      <Select value={selectedRoomId === "" ? "" : String(selectedRoomId)} onValueChange={(value) => setSelectedRoomId(value ? Number(value) : "")} disabled={!selectedWingId || (roomsLoading && roomOptions.length === 0)}>
                        <SelectTrigger id="room_select" className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                          <SelectValue placeholder={!selectedWingId ? "Seleccione primero un ala" : roomsLoading ? "Cargando cuartos disponibles..." : "Seleccionar Cuarto"} />
                        </SelectTrigger>
                        <SelectContent>
                          {roomOptions.map((room) => (
                            <SelectItem key={room.id} value={String(room.id)}>
                              {getRoomLabel(room)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-outline-variant)]/20 flex items-center justify-between gap-4">
                    <p className="min-w-0 flex-1 text-[10px] text-[var(--color-outline)] uppercase tracking-[0.18em] font-bold leading-none truncate">
                      {locationSummaryText}
                    </p>
                  </div>
                </div>
              </section>
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
                  <Textarea value={illnesses} onChange={e => setIllnesses(e.target.value)} placeholder="Ej. Asma, Hipertensión..." />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Medicamentos que consume</label>
                  <Textarea value={medications} onChange={e => setMedications(e.target.value)} placeholder="Tratamientos actuales..." />
                </div>
              </div>
              
              <div className="max-w-md space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--color-outline)] font-bold px-1">Proceso Disciplinario</label>
                <Select value={disciplinary_process} onValueChange={setDisciplinaryProcess}>
                  <SelectTrigger className="w-full bg-[var(--color-surface-container-highest)] border-0 rounded-md px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none h-11 focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alerta Leve">Alerta Leve</SelectItem>
                    <SelectItem value="Sanción Grave">Sanción Grave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 mt-6 border-t border-[var(--color-outline-variant)]/20">
                <h4 className="text-xs font-bold text-[var(--color-outline)] uppercase tracking-widest mb-6">Perfil Sociopolítico e Institucional</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* UJC */}
                  <label className={`group flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-container-high)] rounded-xl cursor-pointer hover:bg-[var(--color-surface-container-highest)] transition-colors ${is_militant ? '!bg-[var(--color-primary-selected)] ring-2 ring-[var(--color-primary)]/40' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--color-on-surface)]">Militante de la UJC/PCC</span>
                      <span className="text-[10px] text-[var(--color-outline)] uppercase">Organización Política</span>
                    </div>
                    <Checkbox checked={is_militant} onCheckedChange={(checked) => setIsMilitant(checked === true)} className="h-5 w-5 rounded-md border-[var(--color-outline)] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)] data-[state=checked]:text-[var(--color-on-primary)]" />
                  </label>
                  {/* MININT */}
                  <label className={`group flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-container-high)] rounded-xl cursor-pointer hover:bg-[var(--color-surface-container-highest)] transition-colors ${is_cadet_minint ? '!bg-[var(--color-primary-selected)] ring-2 ring-[var(--color-primary)]/40' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--color-on-surface)]">Cadete MININT</span>
                      <span className="text-[10px] text-[var(--color-outline)] uppercase">Min. del Interior</span>
                    </div>
                    <Checkbox checked={is_cadet_minint} onCheckedChange={(checked) => setIsCadetMinint(checked === true)} className="h-5 w-5 rounded-md border-[var(--color-outline)] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)] data-[state=checked]:text-[var(--color-on-primary)]" />
                  </label>
                  {/* FAR */}
                  <label className={`group flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-container-high)] rounded-xl cursor-pointer hover:bg-[var(--color-surface-container-highest)] transition-colors ${is_cadet_far ? '!bg-[var(--color-primary-selected)] ring-2 ring-[var(--color-primary)]/40' : ''}`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--color-on-surface)]">Cadete FAR</span>
                      <span className="text-[10px] text-[var(--color-outline)] uppercase">Min. Fuerzas Armadas</span>
                    </div>
                    <Checkbox checked={is_cadet_far} onCheckedChange={(checked) => setIsCadetFar(checked === true)} className="h-5 w-5 rounded-md border-[var(--color-outline)] data-[state=checked]:bg-[var(--color-primary)] data-[state=checked]:border-[var(--color-primary)] data-[state=checked]:text-[var(--color-on-primary)]" />
                  </label>
                </div>
              </div>

              {!isEditing && (
                <div className="pt-8 mt-8 border-t border-[var(--color-outline-variant)]/20">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-[var(--color-primary)]">account_circle</span>
                    <h3 className="text-xl font-bold text-[var(--color-primary)]">Cuenta de Usuario</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-sm font-semibold text-[var(--color-on-surface-variant)]">Nombre de Usuario <span className="text-[var(--color-error)]">*</span></label>
                      </div>
                      <Input id="username" required value={username} onChange={e => setUsername(e.target.value)} type="text" placeholder="Ej. jperez" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="block text-sm font-semibold text-[var(--color-on-surface-variant)]">Contraseña Provisional <span className="text-[var(--color-error)]">*</span></label>
                      </div>
                      <Input id="password" required value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" />
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
                    const missing: string[] = [];
                    if (!facultyId) missing.push("Facultad");
                    if (!careerId) missing.push("Carrera");
                    if (!careerYearId) missing.push("Año académico");

                    if (missing.length > 0) {
                      toast.warning("Faltan campos académicos", {
                        description: `Complete: ${missing.join(", ")}`,
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
      <BottomSheet open={!!validationErrors} onClose={() => setValidationErrors(null)} maxWidthClassName="max-w-lg">
        <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
          <div className="border-b border-[var(--color-primary)]/10 bg-[linear-gradient(180deg,var(--color-primary-selected)_0%,var(--color-surface-container-lowest)_100%)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center text-[var(--color-primary)]">
                  <span className="material-symbols-outlined">info</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--color-primary)]">Validación</p>
                  <h3 className="mt-1 text-lg font-bold text-[var(--color-primary-dark)]">Corrige los campos marcados</h3>
                  <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">Pulsa cualquier error para saltar directamente al campo correspondiente.</p>
                </div>
              </div>
              <div className="shrink-0 rounded-full bg-[var(--color-surface-container-lowest)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/10">
                {validationErrors?.length ?? 0} errores
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6 space-y-3 bg-[var(--color-surface-container-lowest)]">
            {validationErrors?.map((item, idx) => (
              <button
                key={idx}
                onClick={() => focusField(item.key)}
                className="group w-full cursor-pointer rounded-2xl border border-[var(--color-primary)]/10 bg-[var(--color-surface-container-low)] px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)]/20 hover:bg-[var(--color-primary-selected)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 h-10 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)] transition-all group-hover:w-2"></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 items-center rounded-full bg-[var(--color-primary-selected)] px-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                        {item.key}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-outline)]">
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="mt-2 text-sm leading-relaxed text-[var(--color-on-surface)] break-words">
                      {item.message}
                    </div>
                  </div>
                  <div className="mt-1 shrink-0 text-[var(--color-primary)] opacity-80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-[18px] leading-none">north_east</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-end border-t border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] p-6">
            <Button variant="outline" onClick={() => setValidationErrors(null)} className="cursor-pointer border-[var(--color-primary)]/15 text-[var(--color-primary-dark)] hover:bg-[var(--color-primary-selected)]">
              Cerrar
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}