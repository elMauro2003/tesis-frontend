export interface Faculty {
  id: number;
  name: string;
  code: string;
}

export interface Career {
  id: number;
  name: string;
  code: string;
  faculty_id: number;
}

export interface CareerYear {
  id: number;
  year: number;
  career_id: number;
}

export interface Group {
  id: number;
  name: string;
  career_year_id: number;
}
