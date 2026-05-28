export interface StudentCreateRequest {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  ci: string;
  student_id: string;
  birth_date: string;
  gender: string;
  career?: number;
  year?: number;
  group?: number;
  address?: string;
  province?: string;
  municipality?: string;
  phone?: string;
  emergency_phone?: string;
  illnesses?: string;
  medications?: string;
  is_militant?: boolean;
  is_cadet_minint?: boolean;
  is_cadet_far?: boolean;
  academic_performance?: string;
  disciplinary_process?: string;
}

export interface Student {
  id: number;
  ci: string;
  student_id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  created_at?: string;
  address?: string;
  province?: string;
  municipality?: string;
  phone?: string;
  emergency_phone?: string;
  illnesses?: string;
  medications?: string;
  is_militant: boolean;
  is_cadet_minint?: boolean;
  is_cadet_far?: boolean;
  academic_performance?: string;
  disciplinary_process?: string;
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
  group_name?: string;
  age?: number;
  current_room?: {
    number?: string;
    wing?: string;
    building?: string;
  } | null;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  } | number;
  // Fallbacks just in case
  first_name?: string;
  last_name?: string;
}

export interface Professor {
  id: number;
  employee_id: string;
  department: string;
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}
