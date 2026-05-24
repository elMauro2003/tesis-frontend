// Estructura Académica
export interface Faculty {
  id: number;
  name: string;
}

export interface Career {
  id: number;
  name: string;
  faculty: Faculty | number; // Dependiendo si el endpoint retorna objeto o ID
}

export interface AcademicYear {
  id: number;
  year_number: number;
  career: Career | number;
}

export interface Group {
  id: number;
  name: string;
  career_year: AcademicYear | number;
}

// Infraestructura Física
export interface Site {
  id: number;
  name: string;
}

export interface Building {
  id: number;
  name: string;
  site: Site | number;
}

export interface Wing {
  id: number;
  name: string;
  building: Building | number;
}

export interface Room {
  id: number;
  number: string;
  wing: Wing | number;
  capacity: number;
  is_active: boolean;
  occupancy?: number;
  is_full?: boolean;
}

// Gestión de Personas
export interface Student {
  id: number;
  ci: string;
  student_id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  group: {
    id: number;
    name: string;
    career_year: {
      year: number;
      career: {
        id: number;
        name: string;
      };
    };
  };
  is_militant: boolean;
  current_room?: {
    number?: string;
    wing?: string;
    building?: string;
  } | null;
  first_name?: string;
  last_name?: string;
}

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
}

// Operaciones Continuas
export interface Evaluation {
  id: number;
  student: Student | number;
  date: string;
  grade: number; // e.g. 2, 3, 4, 5
  comments?: string;
  evaluator_id: number;
}

export interface Complaint {
  id: number;
  student: Student | number;
  date: string;
  type: string;
  status: 'pendiente' | 'en_proceso' | 'resuelta' | 'rechazada';
  description: string;
  response?: string;
  is_public: boolean;
}

export interface RoomAssignment {
  id: number;
  student: Student | number;
  room: Room | number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export interface RoomDuty { 
  id: number;  // Cuarteleria
  room: Room | number;
  student: Student | number;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface Information {
  id: number;
  title: string;
  content: string;
  created_at: string;
  expires_date: string;
  is_public: boolean;
}

export interface Report {
  id: number;
  type: string;
  generated_date: string;
  file_url: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
