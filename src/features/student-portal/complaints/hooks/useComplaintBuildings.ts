"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/core/services/complaint.service";
import { fetchClient, FetchError } from "@/lib/fetchClient";
import { Building, Complaint, PaginatedResponse } from "@/types/models";

export interface ComplaintBuildingOption {
  id: number;
  name: string;
  label: string;
}

function formatBuildingLabel(name: string, siteName?: string | null) {
  const trimmedName = name.trim();
  const trimmedSite = siteName?.trim();

  return trimmedSite ? `${trimmedName}, ${trimmedSite}` : trimmedName;
}

function upsertBuildingOption(
  map: Map<number, ComplaintBuildingOption>,
  id: number,
  name: string,
  siteName?: string | null
) {
  if (!id || !name.trim()) {
    return;
  }

  const label = formatBuildingLabel(name, siteName);
  const existing = map.get(id);

  if (!existing || label.length > existing.label.length) {
    map.set(id, { id, name: name.trim(), label });
  }
}

function addBuildingsFromComplaints(map: Map<number, ComplaintBuildingOption>, complaints: Complaint[]) {
  for (const complaint of complaints) {
    if (complaint.building && complaint.building_name) {
      upsertBuildingOption(map, complaint.building, complaint.building_name);
    }
  }
}

async function fetchEdificiosCatalog() {
  const map = new Map<number, ComplaintBuildingOption>();
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const response = await fetchClient<PaginatedResponse<Building>>(
      `/api/v1/edificios/?page=${page}&page_size=100`,
      { suppressForbiddenEvent: true }
    );

    for (const building of response.results) {
      const siteName = typeof building.site === "object" ? building.site?.name : undefined;
      upsertBuildingOption(map, building.id, building.name, siteName);
    }

    hasNext = Boolean(response.next);
    page += 1;
  }

  return Array.from(map.values());
}

async function fetchBuildingsFromComplaints() {
  const map = new Map<number, ComplaintBuildingOption>();

  const [mine, publicComplaints] = await Promise.all([
    complaintService.getMyComplaints({ page: 1, page_size: 100 }),
    complaintService.getAllPublicComplaints(),
  ]);

  addBuildingsFromComplaints(map, mine.results);
  addBuildingsFromComplaints(map, publicComplaints.results);

  return Array.from(map.values());
}

async function fetchComplaintBuildings(): Promise<ComplaintBuildingOption[]> {
  try {
    const fromEdificios = await fetchEdificiosCatalog();
    if (fromEdificios.length > 0) {
      return fromEdificios.sort((a, b) => a.label.localeCompare(b.label, "es"));
    }
  } catch (error) {
    if (!(error instanceof FetchError && error.status === 403)) {
      throw error;
    }
  }

  const fromComplaints = await fetchBuildingsFromComplaints();
  return fromComplaints.sort((a, b) => a.label.localeCompare(b.label, "es"));
}

export function useComplaintBuildings(enabled: boolean) {
  return useQuery({
    queryKey: ["portal", "complaint-buildings"],
    enabled,
    queryFn: fetchComplaintBuildings,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
