import { accommodationService } from "@/core/services/accommodation.service";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { teacherService } from "@/core/services/teacher.service";
import { Room } from "@/types/models";

export type WingDeletionSummary = {
  roomCount: number;
  activeAssignmentCount: number;
  roomDutyCount: number;
  hasSupervisor: boolean;
  supervisorName?: string;
};

export type BuildingDeletionSummary = {
  wingCount: number;
  roomCount: number;
  activeAssignmentCount: number;
  roomDutyCount: number;
  supervisorCount: number;
};

export type SiteDeletionSummary = {
  buildingCount: number;
  wingCount: number;
  roomCount: number;
  activeAssignmentCount: number;
  roomDutyCount: number;
  supervisorCount: number;
};

const getRoomId = (room: Room | number): number => (typeof room === "number" ? room : room.id);

const releaseActiveAssignmentsForRoom = async (roomId: number) => {
  const assignments = await accommodationService.getAllAssignments({
    room: roomId,
    is_active: true,
  });

  for (const assignment of assignments.results) {
    await accommodationService.releaseAssignment(assignment.id);
  }
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

export const infrastructureCascadeService = {
  getWingDeletionSummary: async (wingId: number): Promise<WingDeletionSummary> => {
    const [rooms, activeAssignments, roomDuties, supervisors] = await Promise.all([
      infrastructureService.getAllRooms({ wing: wingId }),
      accommodationService.getAllAssignments({ room__wing: wingId, is_active: true }),
      accommodationService.getAllRoomDuties({ room__wing: wingId }),
      teacherService.getSupervisorsByWingIds([wingId]),
    ]);

    const supervisor = supervisors.get(wingId);

    return {
      roomCount: rooms.results.length,
      activeAssignmentCount: activeAssignments.results.length,
      roomDutyCount: roomDuties.results.length,
      hasSupervisor: Boolean(supervisor),
      supervisorName: supervisor?.professor_name,
    };
  },

  getBuildingDeletionSummary: async (buildingId: number): Promise<BuildingDeletionSummary> => {
    const [wings, rooms, activeAssignments] = await Promise.all([
      infrastructureService.getAllWings(buildingId),
      infrastructureService.getAllRooms({ wing__building: buildingId }),
      accommodationService.getAllAssignments({ room__wing__building: buildingId, is_active: true }),
    ]);

    const wingIds = wings.results.map((wing) => wing.id);
    const supervisors = wingIds.length > 0 ? await teacherService.getSupervisorsByWingIds(wingIds) : new Map();

    const dutiesByWing = await Promise.all(
      wingIds.map((wingId) => accommodationService.getAllRoomDuties({ room__wing: wingId }))
    );
    const roomDutyCount = dutiesByWing.reduce((sum, page) => sum + page.results.length, 0);

    return {
      wingCount: wings.results.length,
      roomCount: rooms.results.length,
      activeAssignmentCount: activeAssignments.results.length,
      roomDutyCount,
      supervisorCount: supervisors.size,
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
        roomDutyCount: acc.roomDutyCount + summary.roomDutyCount,
        supervisorCount: acc.supervisorCount + summary.supervisorCount,
      }),
      {
        buildingCount: buildings.results.length,
        wingCount: 0,
        roomCount: 0,
        activeAssignmentCount: 0,
        roomDutyCount: 0,
        supervisorCount: 0,
      }
    );
  },

  deleteRoomWithDependents: async (roomId: number) => {
    await releaseActiveAssignmentsForRoom(roomId);
    await deleteRoomDutiesForRoom(roomId);
    await infrastructureService.deleteRoom(roomId);
  },

  deleteWingWithDependents: async (wingId: number) => {
    const rooms = await infrastructureService.getAllRooms({ wing: wingId });

    for (const room of rooms.results) {
      await infrastructureCascadeService.deleteRoomWithDependents(getRoomId(room));
    }

    await removeWingSupervisorIfAny(wingId);
    await infrastructureService.deleteWing(wingId);
  },

  deleteBuildingWithDependents: async (buildingId: number) => {
    const wings = await infrastructureService.getAllWings(buildingId);

    for (const wing of wings.results) {
      await infrastructureCascadeService.deleteWingWithDependents(wing.id);
    }

    await infrastructureService.deleteBuilding(buildingId);
  },

  deleteSiteWithDependents: async (siteId: number) => {
    const buildings = await infrastructureService.getAllBuildings(siteId);

    for (const building of buildings.results) {
      await infrastructureCascadeService.deleteBuildingWithDependents(building.id);
    }

    await infrastructureService.deleteSite(siteId);
  },
};
