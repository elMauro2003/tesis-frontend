"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { Building, Site, Wing } from "@/types/models";
import { getBuildingSiteId, getWingBuildingId } from "@/features/rooms/utils/roomLabels";

export function useRoomsCatalog() {
  // Mismas query keys que sedes/edificios para reutilizar caché al cambiar de pestaña.
  const sitesQuery = useQuery({
    queryKey: ["sites"],
    queryFn: () => infrastructureService.getAllSites(),
    staleTime: 60 * 1000,
  });

  const buildingsQuery = useQuery({
    queryKey: ["buildings-all"],
    queryFn: () => infrastructureService.getAllBuildings(),
    staleTime: 60 * 1000,
  });

  const wingsQuery = useQuery({
    queryKey: ["wings-all"],
    queryFn: () => infrastructureService.getAllWings(),
    staleTime: 60 * 1000,
  });

  const sites = sitesQuery.data?.results ?? [];
  const buildings = buildingsQuery.data?.results ?? [];
  const wings = wingsQuery.data?.results ?? [];

  const sitesById = useMemo(() => new Map(sites.map((site) => [site.id, site])), [sites]);
  const buildingsById = useMemo(() => new Map(buildings.map((b) => [b.id, b])), [buildings]);
  const wingsById = useMemo(() => new Map(wings.map((w) => [w.id, w])), [wings]);

  const buildingsBySite = useMemo(() => {
    const map = new Map<number, Building[]>();
    for (const building of buildings) {
      const siteId = getBuildingSiteId(building);
      if (siteId === null) continue;
      const current = map.get(siteId) ?? [];
      current.push(building);
      map.set(siteId, current);
    }
    return map;
  }, [buildings]);

  const wingsByBuilding = useMemo(() => {
    const map = new Map<number, Wing[]>();
    for (const wing of wings) {
      const buildingId = getWingBuildingId(wing);
      if (buildingId === null) continue;
      const current = map.get(buildingId) ?? [];
      current.push(wing);
      map.set(buildingId, current);
    }
    return map;
  }, [wings]);

  const isLoading = sitesQuery.isLoading || buildingsQuery.isLoading || wingsQuery.isLoading;
  const isError = sitesQuery.isError || buildingsQuery.isError || wingsQuery.isError;

  return {
    sites,
    buildings,
    wings,
    sitesById,
    buildingsById,
    wingsById,
    buildingsBySite,
    wingsByBuilding,
    isLoading,
    isError,
    refetch: () => {
      sitesQuery.refetch();
      buildingsQuery.refetch();
      wingsQuery.refetch();
    },
  };
}
