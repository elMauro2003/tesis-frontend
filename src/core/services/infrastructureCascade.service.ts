import { accommodationService } from "@/core/services/accommodation.service";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { teacherService } from "@/core/services/teacher.service";
import { FetchError } from "@/lib/fetchClient";
import { Room, RoomAssignment } from "@/types/models";
import { CascadeDeletionBlockedError } from "@/core/services/infrastructureCascade.errors";

export type WingDeletionSummary = {
  roomCount: number;
  activeAssignmentCount: number;
  assignmentRecordCount: number;
  roomDutyCount: number;
  hasSupervisor: boolean;
  supervisorName?: string;
  canDelete: boolean;
  blockedRoomNumbers: string[];
};

export type BuildingDeletionSummary = {
  wingCount: number;
  roomCount: number;
  activeAssignmentCount: number;
  assignmentRecordCount: number;
  roomDutyCount: number;
  supervisorCount: number;
  canDelete: boolean;
  blockedRoomNumbers: string[];
};

export type SiteDeletionSummary = {
  buildingCount: number;
  wingCount: number;
  roomCount: number;
  activeAssignmentCount: number;
  assignmentRecordCount: number;
  roomDutyCount: number;
  supervisorCount: number;
  canDelete: boolean;
  blockedRoomNumbers: string[];
};

export type RoomDeletionSummary = {
  activeAssignmentCount: number;
  assignmentRecordCount: number;
  roomDutyCount: number;
  canDelete: boolean;
};

const isAssignmentActive = (assignment: RoomAssignment): boolean => {
  if (typeof assignment.is_active === "boolean") return assignment.is_active;
  return assignment.released_date == null;
};

const isDependencyConflict = (error: unknown): boolean =>
  error instanceof FetchError && (error.status === 409 || error.status === 400);

const summarizeAssignments = (assignments: RoomAssignment[]) => {
  const activeAssignmentCount = assignments.filter(isAssignmentActive).length;

  return {
    activeAssignmentCount,
    assignmentRecordCount: assignments.length,
  };
};

const getAssignmentsForRoom = async (roomId: number) => {
  const response = await accommodationService.getAllAssignments({ room: roomId });
  return response.results;
};

const getAssignmentsForWing = async (wingId: number) => {
  const response = await accommodationService.getAllAssignments({ room__wing: wingId });
  return response.results;
};

const deleteRoomDutiesForRoom = async (roomId: number) => {
  const duties = await accommodationService.getAllRoomDuties({ room: roomId });

  for (const duty of duties.results) {
    await accommodationService.deleteRoomDuty(duty.id);
  }
};

const removeWingSupervisorIfAny = async (wingId: number) => {
  const supervisors = await teacherService.getSupervisorsByWingIds([wingId]);
  const assignment = supervisors.get(wingId);

  if (assignment) {
    await teacherService.removeWingSupervisor(assignment.professor);
  }
};

const assertRoomCanBeDeleted = async (room: Room) => {
  const assignments = await getAssignmentsForRoom(room.id);

  if (assignments.length > 0) {
    throw new CascadeDeletionBlockedError(
      `El cuarto ${room.number} tiene asignaciones registradas. La API no permite eliminar cuartos con historial de asignaciones.`,
      {
        reason: "assignment_history",
        assignmentRecordCount: assignments.length,
        blockedRoomNumbers: [room.number],
      }
    );
  }
};

const deleteRoomIfAllowed = async (room: Room) => {
  await assertRoomCanBeDeleted(room);
  await deleteRoomDutiesForRoom(room.id);

  try {
    await infrastructureService.deleteRoom(room.id);
  } catch (error) {
    if (isDependencyConflict(error)) {
      throw new CascadeDeletionBlockedError(
        `No se pudo eliminar el cuarto ${room.number} porque aún tiene dependencias en el sistema.`,
        {
          reason: "remaining_rooms",
          blockedRoomNumbers: [room.number],
        }
      );
    }

    throw error;
  }
};

const buildWingDeletionSummary = (
  rooms: Room[],
  wingAssignments: RoomAssignment[],
  roomDutyCount: number,
  supervisorName?: string
): Promise<WingDeletionSummary> => {
  const assignmentSummary = summarizeAssignments(wingAssignments);
  const assignmentsByRoom = new Map<number, number>();

  for (const assignment of wingAssignments) {
    const roomId = typeof assignment.room === "number" ? assignment.room : assignment.room?.id;
    if (roomId == null) continue;
    assignmentsByRoom.set(roomId, (assignmentsByRoom.get(roomId) ?? 0) + 1);
  }

  const blockedRoomNumbers = rooms
    .filter((room) => (assignmentsByRoom.get(room.id) ?? 0) > 0)
    .map((room) => room.number);

  return {
    roomCount: rooms.length,
    ...assignmentSummary,
    roomDutyCount,
    hasSupervisor: Boolean(supervisorName),
    supervisorName,
    canDelete: blockedRoomNumbers.length === 0,
    blockedRoomNumbers,
  };
};

export const infrastructureCascadeService = {
  getRoomDeletionSummary: async (roomId: number): Promise<RoomDeletionSummary> => {
    const [assignments, duties] = await Promise.all([
      getAssignmentsForRoom(roomId),
      accommodationService.getAllRoomDuties({ room: roomId }),
    ]);

    const assignmentSummary = summarizeAssignments(assignments);

    return {
      ...assignmentSummary,
      roomDutyCount: duties.results.length,
      canDelete: assignments.length === 0,
    };
  },

  getWingDeletionSummary: async (wingId: number): Promise<WingDeletionSummary> => {
    const [roomsResponse, wingAssignments, roomDuties, supervisors] = await Promise.all([
      infrastructureService.getAllRooms({ wing: wingId }),
      getAssignmentsForWing(wingId),
      accommodationService.getAllRoomDuties({ room__wing: wingId }),
      teacherService.getSupervisorsByWingIds([wingId]),
    ]);

    const supervisor = supervisors.get(wingId);

    return buildWingDeletionSummary(
      roomsResponse.results,
      wingAssignments,
      roomDuties.results.length,
      supervisor?.professor_name
    );
  },

  getBuildingDeletionSummary: async (buildingId: number): Promise<BuildingDeletionSummary> => {
    const [wings, rooms, buildingAssignments] = await Promise.all([
      infrastructureService.getAllWings(buildingId),
      infrastructureService.getAllRooms({ wing__building: buildingId }),
      accommodationService.getAllAssignments({ room__wing__building: buildingId }),
    ]);

    const wingIds = wings.results.map((wing) => wing.id);
    const supervisors = wingIds.length > 0 ? await teacherService.getSupervisorsByWingIds(wingIds) : new Map();

    const dutiesByWing = await Promise.all(
      wingIds.map((wingId) => accommodationService.getAllRoomDuties({ room__wing: wingId }))
    );
    const roomDutyCount = dutiesByWing.reduce((sum, page) => sum + page.results.length, 0);
    const assignmentSummary = summarizeAssignments(buildingAssignments.results);

    const assignmentsByRoom = new Map<number, number>();
    for (const assignment of buildingAssignments.results) {
      const roomId = typeof assignment.room === "number" ? assignment.room : assignment.room?.id;
      if (roomId == null) continue;
      assignmentsByRoom.set(roomId, (assignmentsByRoom.get(roomId) ?? 0) + 1);
    }

    const blockedRoomNumbers = rooms.results
      .filter((room) => (assignmentsByRoom.get(room.id) ?? 0) > 0)
      .map((room) => room.number);

    return {
      wingCount: wings.results.length,
      roomCount: rooms.results.length,
      ...assignmentSummary,
      roomDutyCount,
      supervisorCount: supervisors.size,
      canDelete: blockedRoomNumbers.length === 0,
      blockedRoomNumbers,
    };
  },

  getSiteDeletionSummary: async (siteId: number): Promise<SiteDeletionSummary> => {
    const buildings = await infrastructureService.getAllBuildings(siteId);
    const summaries = await Promise.all(
      buildings.results.map((building) => infrastructureCascadeService.getBuildingDeletionSummary(building.id))
    );

    return summaries.reduce<SiteDeletionSummary>(
      (acc, summary) => ({
        buildingCount: acc.buildingCount,
        wingCount: acc.wingCount + summary.wingCount,
        roomCount: acc.roomCount + summary.roomCount,
        activeAssignmentCount: acc.activeAssignmentCount + summary.activeAssignmentCount,
        assignmentRecordCount: acc.assignmentRecordCount + summary.assignmentRecordCount,
        roomDutyCount: acc.roomDutyCount + summary.roomDutyCount,
        supervisorCount: acc.supervisorCount + summary.supervisorCount,
        canDelete: acc.canDelete && summary.canDelete,
        blockedRoomNumbers: [...acc.blockedRoomNumbers, ...summary.blockedRoomNumbers],
      }),
      {
        buildingCount: buildings.results.length,
        wingCount: 0,
        roomCount: 0,
        activeAssignmentCount: 0,
        assignmentRecordCount: 0,
        roomDutyCount: 0,
        supervisorCount: 0,
        canDelete: true,
        blockedRoomNumbers: [],
      }
    );
  },

  /**
   * Orden de eliminación (solo endpoints disponibles en la API):
   * 1. Cuartelerías del cuarto
   * 2. Cuarto (solo si no tiene asignaciones registradas)
   */
  deleteRoomWithDependents: async (roomId: number) => {
    const room = await infrastructureService.getRoomById(roomId);
    await deleteRoomIfAllowed(room);
  },

  /**
   * Orden de eliminación para un ala:
   * 1. Validar que ningún cuarto tenga asignaciones registradas
   * 2. Quitar responsable de ala
   * 3. Por cada cuarto: cuartelerías → cuarto
   * 4. Ala
   */
  deleteWingWithDependents: async (wingId: number) => {
    const summary = await infrastructureCascadeService.getWingDeletionSummary(wingId);

    if (!summary.canDelete) {
      throw new CascadeDeletionBlockedError(
        summary.assignmentRecordCount > 0
          ? `No se puede eliminar el ala porque ${summary.blockedRoomNumbers.length} cuarto${summary.blockedRoomNumbers.length === 1 ? "" : "s"} tienen asignaciones registradas (${summary.blockedRoomNumbers.join(", ")}). La API conserva el historial y no permite borrar esos cuartos.`
          : "No se puede eliminar el ala porque aún tiene dependencias activas.",
        {
          reason: "assignment_history",
          assignmentRecordCount: summary.assignmentRecordCount,
          blockedRoomNumbers: summary.blockedRoomNumbers,
        }
      );
    }

    const rooms = await infrastructureService.getAllRooms({ wing: wingId });

    await removeWingSupervisorIfAny(wingId);

    for (const room of rooms.results) {
      await deleteRoomIfAllowed(room);
    }

    try {
      await infrastructureService.deleteWing(wingId);
    } catch (error) {
      if (isDependencyConflict(error)) {
        const remainingRooms = await infrastructureService.getAllRooms({ wing: wingId });

        throw new CascadeDeletionBlockedError(
          remainingRooms.results.length > 0
            ? `Quedaron ${remainingRooms.results.length} cuarto${remainingRooms.results.length === 1 ? "" : "s"} asociados al ala. Revise las dependencias antes de reintentar.`
            : "No se pudo eliminar el ala porque aún tiene dependencias en el sistema.",
          {
            reason: "remaining_rooms",
            blockedRoomNumbers: remainingRooms.results.map((room) => room.number),
          }
        );
      }

      throw error;
    }
  },

  deleteBuildingWithDependents: async (buildingId: number) => {
    const summary = await infrastructureCascadeService.getBuildingDeletionSummary(buildingId);

    if (!summary.canDelete) {
      throw new CascadeDeletionBlockedError(
        `No se puede eliminar el edificio porque hay cuartos con asignaciones registradas (${summary.blockedRoomNumbers.join(", ")}).`,
        {
          reason: "assignment_history",
          assignmentRecordCount: summary.assignmentRecordCount,
          blockedRoomNumbers: summary.blockedRoomNumbers,
        }
      );
    }

    const wings = await infrastructureService.getAllWings(buildingId);

    for (const wing of wings.results) {
      await infrastructureCascadeService.deleteWingWithDependents(wing.id);
    }

    try {
      await infrastructureService.deleteBuilding(buildingId);
    } catch (error) {
      if (isDependencyConflict(error)) {
        const remainingWings = await infrastructureService.getAllWings(buildingId);

        throw new CascadeDeletionBlockedError(
          `Quedaron ${remainingWings.results.length} ala${remainingWings.results.length === 1 ? "" : "s"} en el edificio.`,
          { reason: "remaining_wings" }
        );
      }

      throw error;
    }
  },

  deleteSiteWithDependents: async (siteId: number) => {
    const summary = await infrastructureCascadeService.getSiteDeletionSummary(siteId);

    if (!summary.canDelete) {
      throw new CascadeDeletionBlockedError(
        `No se puede eliminar la sede porque hay cuartos con asignaciones registradas (${summary.blockedRoomNumbers.join(", ")}).`,
        {
          reason: "assignment_history",
          assignmentRecordCount: summary.assignmentRecordCount,
          blockedRoomNumbers: summary.blockedRoomNumbers,
        }
      );
    }

    const buildings = await infrastructureService.getAllBuildings(siteId);

    for (const building of buildings.results) {
      await infrastructureCascadeService.deleteBuildingWithDependents(building.id);
    }

    try {
      await infrastructureService.deleteSite(siteId);
    } catch (error) {
      if (isDependencyConflict(error)) {
        const remainingBuildings = await infrastructureService.getAllBuildings(siteId);

        throw new CascadeDeletionBlockedError(
          `Quedaron ${remainingBuildings.results.length} edificio${remainingBuildings.results.length === 1 ? "" : "s"} en la sede.`,
          { reason: "remaining_buildings" }
        );
      }

      throw error;
    }
  },
};
