import { Building, Room, Site, Wing } from "@/types/models";

export const mockSites: Site[] = [
  {
    id: 1,
    name: "Sede Central",
    address: "Calle Principal 100",
    description: "Campus principal",
  },
];

export const mockBuildings: Building[] = [
  {
    id: 10,
    name: "Edificio A",
    site: 1,
    gender: "Mixto",
  },
];

export const mockWings: Wing[] = [
  {
    id: 20,
    name: "Ala Norte",
    building: 10,
  },
];

export const mockRooms: Room[] = [
  {
    id: 30,
    number: "101",
    wing: 20,
    capacity: 4,
    current_occupancy: 2,
    is_active: true,
    available_spots: 2,
  },
];
