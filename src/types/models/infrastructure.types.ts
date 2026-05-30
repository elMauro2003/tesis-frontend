export interface Site {
  id: number;
  name: string;
  address?: string | null;
  description?: string | null;
  building_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Building {
  id: number;
  name: string;
  site_id: number;
}

export interface Wing {
  id: number;
  name: string;
  building_id: number;
}

export interface Room {
  id: number;
  number: string;
  capacity: number;
  current_occupancy: number;
  is_active: boolean;
  wing_id: number;
  is_full?: boolean;
}
