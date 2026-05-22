export interface Student {
  id: number;
  ci: string;
  student_id: string;
  birth_date: string;
  gender: string;
  group_id: number;
  // Relacionados con User
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
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
