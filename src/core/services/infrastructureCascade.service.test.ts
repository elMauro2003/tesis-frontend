import { beforeEach, describe, expect, it, vi } from "vitest";
import { accommodationService } from "@/core/services/accommodation.service";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { teacherService } from "@/core/services/teacher.service";
import { CascadeDeletionBlockedError } from "@/core/services/infrastructureCascade.errors";
import { infrastructureCascadeService } from "@/core/services/infrastructureCascade.service";

vi.mock("@/core/services/accommodation.service", () => ({
  accommodationService: {
    getAllAssignments: vi.fn(),
    getAllRoomDuties: vi.fn(),
    deleteRoomDuty: vi.fn(),
  },
}));

vi.mock("@/core/services/infrastructure.service", () => ({
  infrastructureService: {
    getAllRooms: vi.fn(),
    getAllWings: vi.fn(),
    getAllBuildings: vi.fn(),
    getRoomById: vi.fn(),
    deleteRoom: vi.fn(),
    deleteWing: vi.fn(),
    deleteBuilding: vi.fn(),
    deleteSite: vi.fn(),
  },
}));

vi.mock("@/core/services/teacher.service", () => ({
  teacherService: {
    getSupervisorsByWingIds: vi.fn(),
    removeWingSupervisor: vi.fn(),
  },
}));

const emptyPage = <T,>(results: T[] = []) => ({
  count: results.length,
  next: null,
  previous: null,
  results,
});

describe("infrastructureCascadeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("elimina un ala sin asignaciones en el orden correcto", async () => {
    const calls: string[] = [];

    vi.mocked(infrastructureService.getAllRooms).mockResolvedValue(
      emptyPage([{ id: 10, number: "101", wing: 1, capacity: 2, is_active: true, current_occupancy: 0 }])
    );
    vi.mocked(accommodationService.getAllAssignments).mockResolvedValue(emptyPage());
    vi.mocked(accommodationService.getAllRoomDuties).mockResolvedValue(
      emptyPage([{ id: 50, room: 10, student: 1, date: "2026-01-01", completed: false }])
    );
    vi.mocked(teacherService.getSupervisorsByWingIds).mockResolvedValue(
      new Map([[1, { professor: 3, professor_name: "Prof. Test", wing: 1, wing_name: "Ala A" }]])
    );
    vi.mocked(teacherService.removeWingSupervisor).mockImplementation(async () => {
      calls.push("remove-supervisor");
    });
    vi.mocked(accommodationService.deleteRoomDuty).mockImplementation(async () => {
      calls.push("delete-duty");
    });
    vi.mocked(infrastructureService.deleteRoom).mockImplementation(async () => {
      calls.push("delete-room");
    });
    vi.mocked(infrastructureService.deleteWing).mockImplementation(async () => {
      calls.push("delete-wing");
    });

    await infrastructureCascadeService.deleteWingWithDependents(1);

    expect(calls).toEqual(["remove-supervisor", "delete-duty", "delete-room", "delete-wing"]);
    expect(teacherService.removeWingSupervisor).toHaveBeenCalledWith(3);
    expect(infrastructureService.deleteWing).toHaveBeenCalledWith(1);
  });

  it("bloquea la eliminación del ala si hay asignaciones registradas", async () => {
    vi.mocked(infrastructureService.getAllRooms).mockResolvedValue(
      emptyPage([{ id: 10, number: "101", wing: 1, capacity: 2, is_active: true, current_occupancy: 1 }])
    );
    vi.mocked(accommodationService.getAllAssignments).mockResolvedValue(
      emptyPage([
        {
          id: 99,
          student: 1,
          room: 10,
          is_active: true,
          assigned_date: "2026-01-01",
          released_date: null,
        },
      ])
    );
    vi.mocked(accommodationService.getAllRoomDuties).mockResolvedValue(emptyPage());
    vi.mocked(teacherService.getSupervisorsByWingIds).mockResolvedValue(new Map());

    await expect(infrastructureCascadeService.deleteWingWithDependents(1)).rejects.toBeInstanceOf(
      CascadeDeletionBlockedError
    );
    expect(infrastructureService.deleteWing).not.toHaveBeenCalled();
  });

  it("marca canDelete=false cuando un cuarto tiene historial", async () => {
    vi.mocked(infrastructureService.getAllRooms).mockResolvedValue(
      emptyPage([{ id: 10, number: "202", wing: 2, capacity: 2, is_active: true, current_occupancy: 0 }])
    );
    vi.mocked(accommodationService.getAllAssignments).mockResolvedValue(
      emptyPage([
        {
          id: 1,
          student: 1,
          room: 10,
          is_active: false,
          assigned_date: "2025-01-01",
          released_date: "2025-06-01",
        },
      ])
    );
    vi.mocked(accommodationService.getAllRoomDuties).mockResolvedValue(emptyPage());
    vi.mocked(teacherService.getSupervisorsByWingIds).mockResolvedValue(new Map());

    const summary = await infrastructureCascadeService.getWingDeletionSummary(2);

    expect(summary.canDelete).toBe(false);
    expect(summary.blockedRoomNumbers).toEqual(["202"]);
    expect(summary.assignmentRecordCount).toBe(1);
  });
});
