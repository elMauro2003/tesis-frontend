import { Building, Room, Site, Wing } from "@/types/models";

type AnyRecord = Record<string, unknown>;

export const getNumericId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  if (value && typeof value === "object" && "id" in value) {
    return getNumericId((value as AnyRecord).id);
  }
  return null;
};

export const getRoomWingId = (room: Room): number | null => getNumericId(room.wing);

export const getWingBuildingId = (wing: Wing): number | null => getNumericId(wing.building);

export const getBuildingSiteId = (building: Building): number | null => getNumericId(building.site);

export type RoomLocationLabels = {
  wingName: string;
  buildingName: string;
  siteName: string;
  subtitle: string;
};

export const resolveRoomLocation = (
  room: Room,
  wingsById: Map<number, Wing>,
  buildingsById: Map<number, Building>,
  sitesById: Map<number, Site>
): RoomLocationLabels => {
  const wingId = getRoomWingId(room);
  const wing =
    typeof room.wing === "object" && room.wing
      ? room.wing
      : wingId !== null
        ? wingsById.get(wingId)
        : undefined;

  const wingName = room.wing_name ?? wing?.name ?? "Ala";
  let buildingName = room.building_name ?? "";
  let siteName = "";

  if (!buildingName && wing) {
    const buildingId = getWingBuildingId(wing);
    const building =
      typeof wing.building === "object" && wing.building
        ? wing.building
        : buildingId !== null
          ? buildingsById.get(buildingId)
          : undefined;
    buildingName = building?.name ?? "";
    if (building) {
      const siteId = getBuildingSiteId(building);
      if (typeof building.site === "object" && building.site && "name" in building.site) {
        siteName = String((building.site as Site).name);
      } else if (siteId !== null) {
        siteName = sitesById.get(siteId)?.name ?? "";
      }
    }
  }

  const parts = [buildingName, siteName].filter(Boolean);
  const subtitle = parts.length > 0 ? parts.join(" • ") : "Ubicación no registrada";

  return { wingName, buildingName, siteName, subtitle };
};

export const getStudentInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
};
