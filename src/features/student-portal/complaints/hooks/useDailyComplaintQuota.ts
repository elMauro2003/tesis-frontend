"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/core/services/complaint.service";
import {
  DAILY_COMPLAINT_LIMIT,
  countTodayComplaints,
} from "@/features/student-portal/complaints/utils/complaintPresentation";

const PAGE_SIZE = 50;

async function fetchTodayComplaintCount() {
  let page = 1;
  let totalCount = 0;

  while (true) {
    const response = await complaintService.getMyComplaints({ page, page_size: PAGE_SIZE });
    totalCount += countTodayComplaints(response.results);

    if (totalCount >= DAILY_COMPLAINT_LIMIT || !response.next) {
      break;
    }

    page += 1;
  }

  return totalCount;
}

export function useDailyComplaintQuota() {
  const query = useQuery({
    queryKey: ["portal", "complaints", "daily-quota"],
    queryFn: fetchTodayComplaintCount,
    staleTime: 30_000,
    retry: 1,
  });

  const todayCount = query.data ?? 0;
  const remainingToday = Math.max(0, DAILY_COMPLAINT_LIMIT - todayCount);

  return {
    todayCount,
    remainingToday,
    canCreate: !query.isError && remainingToday > 0,
    limit: DAILY_COMPLAINT_LIMIT,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
