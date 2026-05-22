export interface Assignment {
  id: number;
  student_id: number;
  room_id: number;
  assigned_date: string;
  released_date: string | null;
  assigned_by_id: number;
  is_active?: boolean;
}

export type ComplaintStatus = 'pendiente' | 'en_proceso' | 'resuelta';
export type ComplaintType = 'administrativa' | 'educativa';

export interface Complaint {
  id: number;
  student_id: number;
  student?: string; // Nombre del estudiante, útil para vistas
  date: string;
  building_id?: number;
  building?: string;
  description: string;
  type: ComplaintType;
  status: ComplaintStatus;
  visibility: boolean;
  response: string | null;
  response_date: string | null;
  created_at?: string;
}

export interface Evaluation {
  id: number;
  student_id: string | number;
  date: string;
  grade: string;
  grade_display?: string;
  comment: string;
  created_by_id?: number;
  created_by?: string;
}

export interface CleaningSchedule {
  id: number;
  room_id: number | string;
  student_id: number | string;
  assigned_date: string;
  completed: boolean;
  evaluation: string | null;
  comments: string;
}

export interface Information {
  id: number;
  title: string;
  content: string;
  published_date: string;
  expires_date: string;
  is_public: boolean;
  created_by_id?: number;
}

export interface Report {
  id: number;
  name: string;
  type: string;
  parameters: Record<string, any>;
  generated_date: string;
  generated_by_id?: number;
  file_url: string;
}
