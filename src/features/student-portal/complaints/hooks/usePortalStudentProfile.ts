"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/core/services/complaint.service";
import { studentService } from "@/core/services/student.service";
import { Student } from "@/types/models";

async function resolveStudentId(): Promise<number | null> {
  try {
    const complaints = await complaintService.getMyComplaints({ page: 1, page_size: 1 });
    const student = complaints.results[0]?.student;

    if (typeof student === "number") {
      return student;
    }

    if (student && typeof student === "object" && "id" in student) {
      return student.id;
    }
  } catch {
    return null;
  }

  return null;
}

async function fetchPortalStudentProfile(): Promise<Student | null> {
  const studentId = await resolveStudentId();
  if (!studentId) {
    return null;
  }

  try {
    return await studentService.getStudentById(studentId);
  } catch {
    return null;
  }
}

export function usePortalStudentProfile(enabled = true) {
  return useQuery({
    queryKey: ["portal", "student-profile"],
    queryFn: fetchPortalStudentProfile,
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
