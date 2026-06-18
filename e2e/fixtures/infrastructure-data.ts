/** Datos de infraestructura reutilizables en capturas y mocks E2E. */

export const sedeCentral = {
  id: 1,
  name: "Sede Central",
  address: "Calle Principal 100",
  description: "Campus principal",
  building_count: 1,
};

export const edificioA = {
  id: 10,
  name: "Edificio A",
  site: 1,
  gender: "Mixto" as const,
};

export const edificioB = {
  id: 11,
  name: "Edificio B",
  site: 1,
  gender: "Varones" as const,
};

export const alaNorte = {
  id: 20,
  name: "Ala Norte",
  building: 10,
  building_name: "Edificio A",
  site_name: "Sede Central",
  room_count: 1,
};

export const alaSur = {
  id: 21,
  name: "Ala Sur",
  building: 10,
  building_name: "Edificio A",
  site_name: "Sede Central",
  room_count: 0,
};

export const cuarto101 = {
  id: 30,
  number: "101",
  wing: 20,
  wing_name: "Ala Norte",
  building_name: "Edificio A",
  capacity: 4,
  current_occupancy: 0,
  is_active: true,
  is_full: false,
  available_spots: 4,
};

export const cuarto102 = {
  id: 31,
  number: "102",
  wing: 20,
  wing_name: "Ala Norte",
  building_name: "Edificio A",
  capacity: 4,
  current_occupancy: 2,
  is_active: true,
  is_full: false,
  available_spots: 2,
};

export const asignacionActivaCuarto102 = {
  id: 900,
  student: 50,
  student_name: "Juan Pérez",
  student_id_code: "E-001",
  room: 31,
  room_detail: "102 — Ala Norte",
  assigned_date: "2026-01-15",
  released_date: null,
  is_active: true,
  assigned_by: 1,
  assigned_by_name: "Admin",
};

export const asignacionHistoricaCuarto102 = {
  id: 901,
  student: 51,
  student_name: "María López",
  student_id_code: "E-002",
  room: 31,
  room_detail: "102 — Ala Norte",
  assigned_date: "2025-09-01",
  released_date: "2025-12-20",
  is_active: false,
  assigned_by: 1,
  assigned_by_name: "Admin",
};

export const cuarteleria101 = {
  id: 700,
  room: 30,
  student: 52,
  date: "2026-02-01",
  completed: false,
};

export const profesorGuia = {
  id: 3,
  full_name: "Prof. Ana Martínez",
  employee_id: "P-003",
  department: "Informática",
  is_wing_supervisor: true,
  is_dean: false,
  is_group_advisor: false,
  is_year_lead_professor: false,
};

export const profesorSinRol = {
  id: 4,
  full_name: "Prof. Luis García",
  employee_id: "P-004",
  department: "Matemática",
  is_wing_supervisor: false,
  is_dean: false,
  is_group_advisor: false,
  is_year_lead_professor: false,
};

export const responsableAlaNorte = {
  professor: 3,
  professor_name: "Prof. Ana Martínez",
  wing: 20,
  wing_name: "Ala Norte",
};
