export interface Student {
  id: number;
  ci: string;
  student_id: string;
  full_name: string;
  birth_date: string;
  gender: string;
  created_at?: string;
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
  is_militant: boolean;
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
