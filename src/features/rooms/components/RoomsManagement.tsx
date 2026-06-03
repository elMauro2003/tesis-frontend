"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardFiltersBar } from "@/components/shared/DashboardFiltersBar";
import { DashboardFilterSelect } from "@/components/shared/DashboardFilterSelect";
import { DashboardPagination } from "@/components/shared/DashboardPagination";
import { SearchField } from "@/components/shared/SearchField";
import { accommodationService } from "@/core/services/accommodation.service";
import { infrastructureService, type RoomListFilters } from "@/core/services/infrastructure.service";
import { AssignStudentModal } from "@/features/rooms/components/AssignStudentModal";
import { CloseRoomModal } from "@/features/rooms/components/CloseRoomModal";
import { DeleteRoomModal } from "@/features/rooms/components/DeleteRoomModal";
import { PermuteRoomModal } from "@/features/rooms/components/PermuteRoomModal";
import { ReleaseAssignmentsModal } from "@/features/rooms/components/ReleaseAssignmentsModal";
import { RoomFormModal } from "@/features/rooms/components/RoomFormModal";
import { RoomsList, EnrichedRoom } from "@/features/rooms/components/RoomsList";
import { ViewRoomPanel } from "@/features/rooms/components/ViewRoomPanel";
import { useRoomsCatalog } from "@/features/rooms/hooks/useRoomsCatalog";
import { getNumericId, resolveRoomLocation } from "@/features/rooms/utils/roomLabels";
import { matchesRoomStatusFilter, RoomStatusFilter } from "@/features/rooms/utils/roomStatus";
import { Room, RoomAssignment } from "@/types/models";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_OPTIONS: Array<{ value: RoomStatusFilter; label: string }> = [
  { value: "all", label: "Estado: Todos" },
  { value: "full", label: "Estado: Lleno" },
  { value: "available", label: "Estado: Disponible" },
  { value: "closed", label: "Estado: Clausurado" },
];

const getAssignmentRoomId = (assignment: RoomAssignment): number | null => getNumericId(assignment.room);

const assignmentMatchesSearch = (assignment: RoomAssignment, query: string): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return false;
  const name = assignment.student_name?.toLowerCase() ?? "";
  const code = assignment.student_id_code?.toLowerCase() ?? "";
  const detail = assignment.room_detail?.toLowerCase() ?? "";
  return name.includes(normalized) || code.includes(normalized) || detail.includes(normalized);
};

export function RoomsManagement() {
  const catalog = useRoomsCatalog();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState<number | "all">("all");
  const [buildingFilter, setBuildingFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<RoomStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [permuteOpen, setPermuteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [viewRoomId, setViewRoomId] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPage = Number(params.get("page") || "1") || 1;
    const initialPageSize = Number(params.get("page_size") || `${DEFAULT_PAGE_SIZE}`) || DEFAULT_PAGE_SIZE;
    const initialSite = params.get("site");
    const initialBuilding = params.get("building");
    const initialSearch = params.get("search") || "";
    const initialStatus = params.get("status") as RoomStatusFilter | null;

    setPage(initialPage);
    setPageSize(PAGE_SIZE_OPTIONS.includes(initialPageSize) ? initialPageSize : DEFAULT_PAGE_SIZE);
    setSiteFilter(initialSite ? Number(initialSite) : "all");
    setBuildingFilter(initialBuilding ? Number(initialBuilding) : "all");
    setSearch(initialSearch);
    setDebouncedSearch(initialSearch);
    if (initialStatus && STATUS_OPTIONS.some((o) => o.value === initialStatus)) {
      setStatusFilter(initialStatus);
    }
  }, []);

  useEffect(() => {
    const deb = window.setTimeout(() => setDebouncedSearch(search), 400);
    return () => window.clearTimeout(deb);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (siteFilter !== "all") params.set("site", String(siteFilter));
    if (buildingFilter !== "all") params.set("building", String(buildingFilter));
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (page > 1) params.set("page", String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set("page_size", String(pageSize));

    const qs = params.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [siteFilter, buildingFilter, debouncedSearch, statusFilter, page, pageSize]);

  const filtersInitializedRef = useRef(false);

  useEffect(() => {
    if (!filtersInitializedRef.current) {
      filtersInitializedRef.current = true;
      return;
    }
    setPage(1);
  }, [debouncedSearch, siteFilter, buildingFilter, statusFilter, pageSize]);

  useEffect(() => {
    if (siteFilter === "all") {
      setBuildingFilter("all");
    }
  }, [siteFilter]);

  const assignmentsQuery = useQuery({
    queryKey: ["active-assignments"],
    queryFn: () => accommodationService.getAllActiveAssignments(),
    staleTime: 60 * 1000,
  });

  const assignmentsByRoom = useMemo(() => {
    const map = new Map<number, RoomAssignment[]>();
    for (const assignment of assignmentsQuery.data?.results ?? []) {
      const roomId = getAssignmentRoomId(assignment);
      if (roomId === null) continue;
      const current = map.get(roomId) ?? [];
      current.push(assignment);
      map.set(roomId, current);
    }
    return map;
  }, [assignmentsQuery.data]);

  const studentMatchedRoomIds = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return null;

    const ids = new Set<number>();
    for (const assignment of assignmentsQuery.data?.results ?? []) {
      if (!assignmentMatchesSearch(assignment, query)) continue;
      const roomId = getAssignmentRoomId(assignment);
      if (roomId !== null) ids.add(roomId);
    }
    return ids;
  }, [assignmentsQuery.data, debouncedSearch]);

  const hasSearch = debouncedSearch.trim().length > 0;
  const useClientPagination = statusFilter !== "all" || hasSearch;

  const roomsQuery = useQuery({
    queryKey: [
      "rooms",
      {
        debouncedSearch,
        siteFilter,
        buildingFilter,
        statusFilter,
        page,
        pageSize,
        useClientPagination,
      },
    ],
    queryFn: async () => {
      const apiFilters: RoomListFilters = {
        ordering: "number",
      };

      if (hasSearch) apiFilters.search = debouncedSearch.trim();
      if (siteFilter !== "all") apiFilters.wing__building__site = siteFilter;
      if (buildingFilter !== "all") apiFilters.wing__building = buildingFilter;
      if (statusFilter === "closed") apiFilters.is_active = false;

      if (useClientPagination) {
        const all = await infrastructureService.getAllRooms(apiFilters);
        let results = all.results;

        if (statusFilter !== "all") {
          results = results.filter((room) => matchesRoomStatusFilter(room, statusFilter));
        }

        if (hasSearch) {
          const searchLower = debouncedSearch.trim().toLowerCase();
          const apiIds = new Set(results.map((r) => r.id));

          if (studentMatchedRoomIds && studentMatchedRoomIds.size > 0) {
            const extraIds = [...studentMatchedRoomIds].filter((id) => !apiIds.has(id));
            if (extraIds.length > 0) {
              const extras = await Promise.all(
                extraIds.map((id) => infrastructureService.getRoomById(id).catch(() => null))
              );
              results = [...results, ...extras.filter((r): r is Room => r !== null)];
            }
          }

          results = results.filter(
            (room) =>
              room.number.toLowerCase().includes(searchLower) ||
              (studentMatchedRoomIds?.has(room.id) ?? false)
          );
        }

        const total = results.length;
        const totalPagesForQuery = Math.max(1, Math.ceil(total / pageSize));
        const currentPage = Math.min(Math.max(1, page), totalPagesForQuery);
        const start = (currentPage - 1) * pageSize;

        return {
          count: total,
          next: start + pageSize < total ? "client" : null,
          previous: currentPage > 1 ? "client" : null,
          results: results.slice(start, start + pageSize),
        };
      }

      return infrastructureService.getRooms({
        ...apiFilters,
        page: Math.max(1, page),
        page_size: pageSize,
      });
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  const filteredBuildings = useMemo(() => {
    if (siteFilter === "all") return catalog.buildings;
    return catalog.buildingsBySite.get(siteFilter) ?? [];
  }, [catalog.buildings, catalog.buildingsBySite, siteFilter]);

  const enrichedItems: EnrichedRoom[] = useMemo(() => {
    const rooms = roomsQuery.data?.results ?? [];
    return rooms.map((room) => {
      const location = resolveRoomLocation(room, catalog.wingsById, catalog.buildingsById, catalog.sitesById);
      const title = room.number;
      const subtitle =
        [location.buildingName, location.siteName].filter(Boolean).join(" • ") || location.subtitle;
      return {
        room,
        title,
        subtitle,
        assignments: assignmentsByRoom.get(room.id) ?? [],
      };
    });
  }, [roomsQuery.data, catalog, assignmentsByRoom]);

  const totalCount = roomsQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (totalCount === 0) return;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages, totalCount]);

  const viewItem = useMemo(
    () => enrichedItems.find((item) => item.room.id === viewRoomId) ?? null,
    [enrichedItems, viewRoomId]
  );

  const selectedEnriched = useMemo(
    () => (selectedRoom ? enrichedItems.find((i) => i.room.id === selectedRoom.id) : null),
    [selectedRoom, enrichedItems]
  );

  const openCreate = () => {
    setSelectedRoom(null);
    setFormOpen(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormOpen(true);
  };

  const handleView = (room: Room) => {
    setViewRoomId(room.id);
  };

  const handleDelete = (room: Room) => {
    setSelectedRoom(room);
    setDeleteOpen(true);
  };

  const handleCloseRoom = (room: Room) => {
    setSelectedRoom(room);
    setCloseOpen(true);
  };

  const handleRevoke = (room: Room) => {
    const assignments = assignmentsByRoom.get(room.id) ?? [];
    if (assignments.length === 0) {
      toast.info("Sin asignaciones activas", {
        description: "Este cuarto no tiene estudiantes que revocar.",
      });
      return;
    }
    setSelectedRoom(room);
    setReleaseOpen(true);
  };

  const handleAssignStudent = (room: Room) => {
    const roomAssignments = assignmentsByRoom.get(room.id) ?? [];
    if (!room.is_active) {
      toast.warning("Cuarto clausurado", { description: "Reactive el cuarto antes de registrar estudiantes." });
      return;
    }
    if (roomAssignments.length >= room.capacity) {
      toast.info("Sin plazas disponibles", {
        description: "Este cuarto ya alcanzó su capacidad máxima.",
      });
      return;
    }
    setSelectedRoom(room);
    setAssignOpen(true);
  };

  const handlePermute = (room: Room) => {
    const assignments = assignmentsByRoom.get(room.id) ?? [];
    if (assignments.length === 0) {
      toast.info("Sin ocupantes", { description: "Seleccione un cuarto con estudiantes asignados para permutar." });
      return;
    }
    if (!room.is_active) {
      toast.warning("Cuarto clausurado", { description: "Reactive el cuarto antes de permutar estudiantes." });
      return;
    }
    setSelectedRoom(room);
    setPermuteOpen(true);
  };

  const errorMessage =
    roomsQuery.error instanceof Error
      ? roomsQuery.error.message
      : catalog.isError
        ? "Error cargando catálogo de sedes y edificios"
        : null;

  return (
    <div className="w-full space-y-6">
      <DashboardPageHeader
        title="Cuartos"
        description="Administre la capacidad, el estado y las asignaciones de cada cuarto del sistema de residencias."
        topBadge="Infraestructura"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por número de cuarto o estudiante..."
        actionLabel="Añadir cuarto"
        actionIcon="add"
        onAction={openCreate}
        searchComponent={
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Buscar por número de cuarto o estudiante..."
          />
        }
      />

      <DashboardFiltersBar
        left={
          <div className="flex flex-wrap items-center gap-3">
            <DashboardFilterSelect
              className="w-full sm:min-w-[140px] sm:w-auto"
              value={siteFilter === "all" ? "all" : String(siteFilter)}
              onValueChange={(value) => setSiteFilter(value === "all" ? "all" : Number(value))}
              placeholder="Sede: Todas"
              options={[
                { value: "all", label: "Sede: Todas" },
                ...catalog.sites.map((site) => ({ value: String(site.id), label: site.name })),
              ]}
            />
            <DashboardFilterSelect
              className="w-full sm:min-w-[140px] sm:w-auto"
              value={buildingFilter === "all" ? "all" : String(buildingFilter)}
              onValueChange={(value) => setBuildingFilter(value === "all" ? "all" : Number(value))}
              placeholder="Edificio: Todos"
              disabled={siteFilter === "all"}
              options={[
                { value: "all", label: "Edificio: Todos" },
                ...filteredBuildings.map((b) => ({ value: String(b.id), label: b.name })),
              ]}
            />
          </div>
        }
        right={
          <DashboardFilterSelect
            className="w-full sm:min-w-[160px] sm:w-auto"
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as RoomStatusFilter)}
            placeholder="Estado: Todos"
            options={STATUS_OPTIONS}
          />
        }
      />

      <RoomsList
        items={enrichedItems}
        loading={roomsQuery.isLoading}
        error={errorMessage}
        onRetry={() => {
          roomsQuery.refetch();
          catalog.refetch();
        }}
        onCreate={openCreate}
        onView={handleView}
        onEdit={handleEdit}
        onPermute={handlePermute}
        onRevoke={handleRevoke}
        onAssignStudent={handleAssignStudent}
        onClose={handleCloseRoom}
        onDelete={handleDelete}
      />

      <DashboardPagination
        page={safePage}
        totalPages={totalPages}
        totalItems={totalCount}
        itemLabel="cuartos"
        pageSize={pageSize}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <RoomFormModal
        room={selectedRoom}
        sites={catalog.sites}
        buildings={catalog.buildings}
        wings={catalog.wings}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedRoom(null);
        }}
        onSaved={() => roomsQuery.refetch()}
      />

      <ViewRoomPanel
        roomId={viewRoomId}
        roomLabel={viewItem?.room.number ?? ""}
        locationSubtitle={viewItem?.subtitle ?? ""}
        assignments={viewItem?.assignments ?? []}
        open={viewRoomId !== null}
        onClose={() => setViewRoomId(null)}
      />

      <DeleteRoomModal
        room={deleteOpen ? selectedRoom : null}
        roomLabel={selectedEnriched?.title ?? selectedRoom?.number ?? ""}
        assignmentCount={selectedEnriched?.assignments.length ?? 0}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedRoom(null);
        }}
        onDeleted={() => roomsQuery.refetch()}
      />

      <CloseRoomModal
        room={closeOpen ? selectedRoom : null}
        roomLabel={selectedEnriched?.title ?? selectedRoom?.number ?? ""}
        assignmentCount={selectedEnriched?.assignments.length ?? 0}
        open={closeOpen}
        onClose={() => {
          setCloseOpen(false);
          setSelectedRoom(null);
        }}
        onClosed={() => roomsQuery.refetch()}
      />

      <ReleaseAssignmentsModal
        room={releaseOpen ? selectedRoom : null}
        roomLabel={selectedEnriched?.title ?? selectedRoom?.number ?? ""}
        assignments={selectedEnriched?.assignments ?? []}
        open={releaseOpen}
        onClose={() => {
          setReleaseOpen(false);
          setSelectedRoom(null);
        }}
        onReleased={() => {
          roomsQuery.refetch();
          void assignmentsQuery.refetch();
        }}
      />

      <AssignStudentModal
        room={assignOpen ? selectedRoom : null}
        roomLabel={selectedEnriched?.title ?? selectedRoom?.number ?? ""}
        assignments={selectedEnriched?.assignments ?? []}
        open={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          setSelectedRoom(null);
        }}
        onAssigned={() => {
          roomsQuery.refetch();
          void assignmentsQuery.refetch();
        }}
      />

      <PermuteRoomModal
        room={permuteOpen ? selectedRoom : null}
        sourceLocationLabel={selectedEnriched?.subtitle ?? ""}
        assignments={selectedEnriched?.assignments ?? []}
        sites={catalog.sites}
        buildings={catalog.buildings}
        wings={catalog.wings}
        open={permuteOpen}
        onClose={() => {
          setPermuteOpen(false);
          setSelectedRoom(null);
        }}
        onPermuted={() => {
          roomsQuery.refetch();
          void assignmentsQuery.refetch();
        }}
      />
    </div>
  );
}
