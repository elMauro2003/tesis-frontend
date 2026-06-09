"use client";

import { useQuery } from "@tanstack/react-query";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { Site } from "@/types/models";

export interface DashboardComplaintBuildingOption {
  id: number;
  name: string;
  label: string;
}

function formatBuildingLabel(name: string, siteName?: string | null) {
  const trimmedName = name.trim();
  const trimmedSite = siteName?.trim();
  return trimmedSite ? `${trimmedName}, ${trimmedSite}` : trimmedName;
}

function getSiteName(site: Site | number | undefined) {
  if (typeof site === "object" && site?.name) {
    return site.name;
  }

  return null;
}

export function useDashboardComplaintBuildings(enabled: boolean) {
  return useQuery({
    queryKey: ["complaint-buildings", "dashboard"],
    enabled,
    queryFn: async (): Promise<DashboardComplaintBuildingOption[]> => {
      const response = await infrastructureService.getAllBuildings();

      return (response.results ?? [])
        .map((building) => ({
          id: building.id,
          name: building.name,
          label: formatBuildingLabel(building.name, getSiteName(building.site)),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "es"));
    },
    staleTime: 5 * 60_000,
  });
}
