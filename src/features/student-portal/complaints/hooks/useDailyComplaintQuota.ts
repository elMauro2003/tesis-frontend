"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/core/services/complaint.service";
import {
  DAILY_COMPLAINT_LIMIT,
  countTodayComplaints,
} from "@/features/student-portal/complaints/utils/complaintPresentation";

const QUOTA_PAGE_SIZE = 100;

async function fetchTodayComplaintCount() {
  const response = await complaintService.getMyComplaints({
    page: 1,
    page_size: QUOTA_PAGE_SIZE,
  });

  return countTodayComplaints(response.results);
}

export function useDailyComplaintQuota() {
  const query = useQuery({
    queryKey: ["portal", "complaints", "daily-quota"],
    queryFn: fetchTodayComplaintCount,
    staleTime: 30_000,
  });

  const todayCount = query.data ?? 0;
  const remainingToday = Math.max(0, DAILY_COMPLAINT_LIMIT - todayCount);

  return {
    todayCount,
    remainingToday,
    canCreate: remainingToday > 0,
    limit: DAILY_COMPLAINT_LIMIT,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
