import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import EstudiantesPage from "@/app/dashboard/estudiantes/page";
import { studentService } from "@/core/services/student.service";
import { accommodationService } from "@/core/services/accommodation.service";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { academicService } from "@/core/services/academic.service";
import { emptyPaginated, renderWithProviders } from "@/test/test-utils";

vi.mock("@/core/services/student.service", () => ({
  studentService: {
    getStudents: vi.fn(),
    getAllStudents: vi.fn(),
    getStudentsByIds: vi.fn(),
  },
}));

vi.mock("@/core/services/accommodation.service", () => ({
  accommodationService: {
    getAllActiveAssignments: vi.fn(),
  },
}));

vi.mock("@/core/services/infrastructure.service", () => ({
  infrastructureService: {
    getAllBuildings: vi.fn(),
    getAllWings: vi.fn(),
    getAllRooms: vi.fn(),
  },
}));

vi.mock("@/core/services/academic.service", () => ({
  academicService: {
    getFaculties: vi.fn(),
    getCareers: vi.fn(),
    getAcademicYears: vi.fn(),
    getGroups: vi.fn(),
  },
}));

describe("EstudiantesPage", () => {
  beforeEach(() => {
    vi.mocked(studentService.getStudents).mockResolvedValue(emptyPaginated());
    vi.mocked(studentService.getAllStudents).mockResolvedValue(emptyPaginated());
    vi.mocked(studentService.getStudentsByIds).mockResolvedValue([]);
    vi.mocked(accommodationService.getAllActiveAssignments).mockResolvedValue(emptyPaginated());
    vi.mocked(infrastructureService.getAllBuildings).mockResolvedValue(emptyPaginated());
    vi.mocked(infrastructureService.getAllWings).mockResolvedValue(emptyPaginated());
    vi.mocked(infrastructureService.getAllRooms).mockResolvedValue(emptyPaginated());
    vi.mocked(academicService.getFaculties).mockResolvedValue(emptyPaginated());
    vi.mocked(academicService.getCareers).mockResolvedValue(emptyPaginated());
    vi.mocked(academicService.getAcademicYears).mockResolvedValue(emptyPaginated());
    vi.mocked(academicService.getGroups).mockResolvedValue(emptyPaginated());
  });

  it("renderiza la cabecera y estado vacío", async () => {
    renderWithProviders(<EstudiantesPage />);

    expect(screen.getByRole("heading", { level: 1, name: /^estudiantes$/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/aún no hay estudiantes/i)).toBeInTheDocument();
    });
  });
});
