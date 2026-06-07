import { Building, Complaint, Room, RoomAssignment, Site, Wing } from "@/types/models";
import { getBuildingSiteId, getNumericId, getRoomWingId, getWingBuildingId } from "@/features/rooms/utils/roomLabels";
import { COMPLAINTS_LOOKBACK_DAYS } from "@/features/reports/constants";

export type BuildingOccupancyRow = {
  buildingId: number;
  label: string;
  occupied: number;
  capacity: number;
  percent: number;
};

export type ComplaintStatusBreakdown = {
  pendiente: number;
  en_proceso: number;
  resuelta: number;
  rechazada: number;
  total: number;
  efficacyPercent: number;
};

const getRoomOccupancy = (room: Room) => room.current_occupancy ?? 0;

export const filterRoomsBySiteAndBuilding = (
  rooms: Room[],
  wingsById: Map<number, Wing>,
  buildingsById: Map<number, Building>,
  siteId: number | "all",
  buildingId: number | "all"
): Room[] => {
  return rooms.filter((room) => {
    const wingId = getRoomWingId(room);
    if (wingId === null) return siteId === "all" && buildingId === "all";

    const wing = wingsById.get(wingId);
    const roomBuildingId = wing ? getWingBuildingId(wing) : null;
    if (roomBuildingId === null) return false;

    if (buildingId !== "all" && roomBuildingId !== buildingId) {
      return false;
    }

    if (siteId === "all") {
      return true;
    }

    const building = buildingsById.get(roomBuildingId);
    const roomSiteId = building ? getBuildingSiteId(building) : null;
    return roomSiteId === siteId;
  });
};

export const computeAvailableSpots = (rooms: Room[]): number =>
  rooms.reduce((sum, room) => {
    if (!room.is_active) return sum;
    const occupancy = getRoomOccupancy(room);
    return sum + Math.max(0, room.capacity - occupancy);
  }, 0);

export const computeClosedRoomsCount = (rooms: Room[]): number =>
  rooms.filter((room) => !room.is_active).length;

export const computeBuildingOccupancy = (
  rooms: Room[],
  wingsById: Map<number, Wing>,
  buildingsById: Map<number, Building>,
  sitesById: Map<number, Site>,
  siteId: number | "all",
  buildingId: number | "all"
): BuildingOccupancyRow[] => {
  const scopedRooms = filterRoomsBySiteAndBuilding(rooms, wingsById, buildingsById, siteId, buildingId);
  const totals = new Map<number, { occupied: number; capacity: number }>();

  for (const room of scopedRooms) {
    if (!room.is_active) continue;

    const wingId = getRoomWingId(room);
    const wing = wingId !== null ? wingsById.get(wingId) : null;
    const roomBuildingId = wing ? getWingBuildingId(wing) : null;
    if (roomBuildingId === null) continue;

    const current = totals.get(roomBuildingId) ?? { occupied: 0, capacity: 0 };
    current.occupied += getRoomOccupancy(room);
    current.capacity += room.capacity;
    totals.set(roomBuildingId, current);
  }

  return Array.from(totals.entries())
    .map(([id, stats]) => {
      const building = buildingsById.get(id);
      const site = building ? sitesById.get(getBuildingSiteId(building) ?? -1) : undefined;
      const siteLabel = site?.name ? ` (${site.name})` : "";
      const percent = stats.capacity > 0 ? Math.round((stats.occupied / stats.capacity) * 100) : 0;

      return {
        buildingId: id,
        label: `${building?.name ?? `Edificio ${id}`}${siteLabel}`,
        occupied: stats.occupied,
        capacity: stats.capacity,
        percent: Math.min(100, percent),
      };
    })
    .sort((a, b) => b.percent - a.percent);
};

export const filterComplaintsByLookback = (complaints: Complaint[], days = COMPLAINTS_LOOKBACK_DAYS): Complaint[] => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return complaints.filter((complaint) => {
    const rawDate = complaint.date;
    if (!rawDate) return true;
    const parsed = new Date(rawDate);
    return !Number.isNaN(parsed.getTime()) && parsed >= cutoff;
  });
};

export const computeComplaintStatusBreakdown = (complaints: Complaint[]): ComplaintStatusBreakdown => {
  const breakdown: ComplaintStatusBreakdown = {
    pendiente: 0,
    en_proceso: 0,
    resuelta: 0,
    rechazada: 0,
    total: complaints.length,
    efficacyPercent: 0,
  };

  for (const complaint of complaints) {
    if (complaint.status in breakdown) {
      breakdown[complaint.status] += 1;
    }
  }

  const resolved = breakdown.resuelta;
  const closed = breakdown.resuelta + breakdown.rechazada;
  breakdown.efficacyPercent = closed > 0 ? Math.round((resolved / closed) * 100) : 0;

  return breakdown;
};

export const countActiveAssignmentsInRooms = (
  assignments: RoomAssignment[],
  roomIds: Set<number>
): number => {
  return assignments.filter((assignment) => {
    const roomId = getNumericId(assignment.room);
    return roomId !== null && roomIds.has(roomId);
  }).length;
};

export const filterComplaintsByBuilding = (
  complaints: Complaint[],
  buildingId: number | "all"
): Complaint[] => {
  if (buildingId === "all") return complaints;
  return complaints.filter((complaint) => complaint.building === buildingId);
};

export const filterComplaintsBySite = (
  complaints: Complaint[],
  siteId: number | "all",
  buildingsById: Map<number, Building>
): Complaint[] => {
  if (siteId === "all") {
    return complaints;
  }

  const siteBuildingIds = new Set<number>();
  for (const [buildingId, building] of buildingsById) {
    const buildingSiteId = getNumericId(building.site);
    if (buildingSiteId === siteId) {
      siteBuildingIds.add(buildingId);
    }
  }

  return complaints.filter((complaint) => {
    const complaintBuildingId = getNumericId(complaint.building);
    return complaintBuildingId !== null && siteBuildingIds.has(complaintBuildingId);
  });
};

export const filterComplaintsByScope = (
  complaints: Complaint[],
  siteId: number | "all",
  buildingId: number | "all",
  buildingsById: Map<number, Building>
): Complaint[] => filterComplaintsBySite(filterComplaintsByBuilding(complaints, buildingId), siteId, buildingsById);

export const buildReportParameters = (filters: {
  siteId: number | "all";
  buildingId: number | "all";
  facultyId: number | "all";
  careerId?: number | "all";
  academicYear: number | "all";
  housing: string;
  gender?: string;
  militant?: string;
  performance?: string;
  reportType?: string;
}) => ({
  site_id: filters.siteId === "all" ? null : filters.siteId,
  building_id: filters.buildingId === "all" ? null : filters.buildingId,
  faculty_id: filters.facultyId === "all" ? null : filters.facultyId,
  career_id: filters.careerId === "all" || filters.careerId === undefined ? null : filters.careerId,
  academic_year: filters.academicYear === "all" ? null : filters.academicYear,
  housing: filters.housing,
  gender: filters.gender === "all" || !filters.gender ? null : filters.gender,
  militant: filters.militant === "all" || !filters.militant ? null : filters.militant,
  performance: filters.performance === "all" || !filters.performance ? null : filters.performance,
  format: "pdf",
  source: "frontend-preview",
});
