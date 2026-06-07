"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { communicationService } from "@/core/services/communication.service";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardFiltersBar } from "@/components/shared/DashboardFiltersBar";
import { DashboardFilterSelect } from "@/components/shared/DashboardFilterSelect";
import { DashboardSegmentedFilter } from "@/components/shared/DashboardSegmentedFilter";
import { DashboardEmptyState } from "@/components/shared/DashboardEmptyState";
import { DashboardPagination } from "@/components/shared/DashboardPagination";
import { AnnouncementCard } from "@/features/announcements/components/AnnouncementCard";
import { AnnouncementFormModal } from "@/features/announcements/components/AnnouncementFormModal";
import { DeleteAnnouncementModal } from "@/features/announcements/components/DeleteAnnouncementModal";
import { DEFAULT_ANNOUNCEMENTS_PAGE_SIZE } from "@/features/announcements/constants";
import {
  AnnouncementStatusFilter,
  AnnouncementVisibilityFilter,
  AnnouncementWithCategory,
} from "@/features/announcements/types";
import {
  getAnnouncementCategory,
  getAnnouncementArchivePayload,
  getAnnouncementUnarchivePayload,
  isAnnouncementArchived,
} from "@/features/announcements/utils/announcementPresentation";
import { FetchError } from "@/lib/fetchClient";
import { Information } from "@/types/models";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const visibilityOptions = [
  { value: "all", label: "Todos los anuncios" },
  { value: "public", label: "Solo públicos" },
  { value: "private", label: "Solo internos" },
];

const statusOptions = [
  { value: "active", label: "Activos" },
  { value: "archived", label: "Archivados" },
];

const toApiVisibilityFilter = (filter: AnnouncementVisibilityFilter) => {
  if (filter === "public") {
    return true;
  }

  if (filter === "private") {
    return false;
  }

  return undefined;
};

export function AnnouncementsManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<AnnouncementVisibilityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<AnnouncementStatusFilter>("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_ANNOUNCEMENTS_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Information | null>(null);
  const [archiveTargetId, setArchiveTargetId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 450);
    return () => window.clearTimeout(timer);
  }, [search]);

  const apiIsPublic = toApiVisibilityFilter(visibilityFilter);

  const announcementsQuery = useQuery({
    queryKey: ["announcements", { is_public: apiIsPublic, search: debouncedSearch }],
    queryFn: () =>
      communicationService.getAllInformations({
        is_public: apiIsPublic,
        search: debouncedSearch || undefined,
        ordering: "-created_at",
      }),
    staleTime: 60 * 1000,
  });

  const announcementsWithCategory = useMemo<AnnouncementWithCategory[]>(() => {
    return (announcementsQuery.data?.results ?? []).map((announcement) => ({
      ...announcement,
      category: getAnnouncementCategory(announcement),
    }));
  }, [announcementsQuery.data?.results]);

  const filteredAnnouncements = useMemo(() => {
    return announcementsWithCategory.filter((announcement) => {
      const archived = isAnnouncementArchived(announcement);
      return statusFilter === "active" ? !archived : archived;
    });
  }, [announcementsWithCategory, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedAnnouncements = useMemo(
    () => filteredAnnouncements.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredAnnouncements, safePage, pageSize]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const resetPage = () => setPage(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    resetPage();
  };

  const handleVisibilityChange = (value: string) => {
    setVisibilityFilter(value as AnnouncementVisibilityFilter);
    resetPage();
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as AnnouncementStatusFilter);
    resetPage();
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    resetPage();
  };

  const handleClearFilters = () => {
    setSearch("");
    setVisibilityFilter("all");
    setStatusFilter("active");
    resetPage();
  };

  const openCreateModal = () => {
    setSelectedAnnouncement(null);
    setFormOpen(true);
  };

  const openEditModal = (announcement: Information) => {
    setSelectedAnnouncement(announcement);
    setFormOpen(true);
  };

  const openDeleteModal = (announcement: Information) => {
    setSelectedAnnouncement(announcement);
    setDeleteOpen(true);
  };

  const archiveMutation = useMutation({
    mutationFn: async (announcement: Information) => {
      setArchiveTargetId(announcement.id);
      await communicationService.updateInformation(announcement.id, getAnnouncementArchivePayload());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Anuncio archivado", {
        description: "El comunicado pasó al tablón de archivados.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo archivar el anuncio", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
    onSettled: () => {
      setArchiveTargetId(null);
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: async (announcement: AnnouncementWithCategory) => {
      setArchiveTargetId(announcement.id);
      await communicationService.updateInformation(
        announcement.id,
        getAnnouncementUnarchivePayload(announcement)
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Anuncio restaurado", {
        description: "El comunicado volvió al tablón activo.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo restaurar el anuncio", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
    onSettled: () => {
      setArchiveTargetId(null);
    },
  });

  const handleArchive = (announcement: AnnouncementWithCategory) => {
    archiveMutation.mutate(announcement);
  };

  const handleUnarchive = (announcement: AnnouncementWithCategory) => {
    unarchiveMutation.mutate(announcement);
  };

  const isArchivePending = archiveMutation.isPending || unarchiveMutation.isPending;

  const isLoading = announcementsQuery.isLoading;
  const isError = announcementsQuery.isError;
  const hasFiltersApplied =
    debouncedSearch.length > 0 || visibilityFilter !== "all" || statusFilter !== "active";
  const isTrulyEmpty = !hasFiltersApplied && announcementsWithCategory.length === 0;

  return (
    <div className="w-full space-y-8">
      <DashboardPageHeader
        title="Tablón de Anuncios"
        description="Publique y administre comunicados importantes para la comunidad estudiantil desde un tablón centralizado."
        topBadge="Comunicación institucional"
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar anuncio por título o contenido..."
        actionLabel="Nuevo anuncio"
        actionIcon="add"
        onAction={openCreateModal}
      />

      <DashboardFiltersBar
        left={
          <DashboardFilterSelect
            className="w-full sm:w-56"
            value={visibilityFilter}
            onValueChange={handleVisibilityChange}
            placeholder="Visibilidad"
            options={visibilityOptions}
          />
        }
        right={
          <DashboardSegmentedFilter
            value={statusFilter}
            onValueChange={handleStatusChange}
            options={statusOptions}
          />
        }
      />

      <section className="overflow-hidden rounded-3xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="flex items-center justify-between gap-4 bg-[var(--color-surface-container-low)] px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-[var(--color-primary-dark)]">
              {statusFilter === "archived" ? "Tablón archivado" : "Tablón activo"}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              {isLoading
                ? "Cargando anuncios..."
                : `${filteredAnnouncements.length} anuncio${filteredAnnouncements.length === 1 ? "" : "s"} visible${filteredAnnouncements.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
            Panel de gestión
          </div>
        </div>

        <div className="p-6">
          {isError ? (
            <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-6 text-sm text-[var(--color-on-surface-variant)]">
              No fue posible cargar los anuncios en este momento. Intente nuevamente.
            </div>
          ) : isLoading ? (
            <div className="mx-auto max-w-3xl space-y-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl bg-[var(--color-surface-container-low)] p-8"
                >
                  <div className="mb-6 flex justify-between">
                    <div className="h-6 w-24 rounded-full bg-[var(--color-surface-container-high)]" />
                    <div className="h-4 w-28 rounded bg-[var(--color-surface-container-high)]" />
                  </div>
                  <div className="mb-4 h-8 w-2/3 rounded bg-[var(--color-surface-container-high)]" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-[var(--color-surface-container-high)]" />
                    <div className="h-4 w-5/6 rounded bg-[var(--color-surface-container-high)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <DashboardEmptyState
              title={hasFiltersApplied ? "Sin resultados" : "El tablón está vacío"}
              description={
                hasFiltersApplied
                  ? "Ningún anuncio coincide con los filtros o la búsqueda actuales."
                  : "Aún no hay comunicados publicados. Use el botón «Nuevo anuncio» en la cabecera para crear el primero."
              }
              icon={hasFiltersApplied ? "filter_alt_off" : "campaign"}
              secondaryAction={
                hasFiltersApplied ? (
                  <Button type="button" variant="neutral" onClick={handleClearFilters}>
                    <span className="material-symbols-outlined text-lg">filter_alt_off</span>
                    Limpiar filtros
                  </Button>
                ) : isTrulyEmpty ? (
                  <p className="text-xs italic text-[var(--color-outline)]">
                    Los comunicados aparecerán aquí en cuanto se publiquen.
                  </p>
                ) : undefined
              }
            />
          ) : (
            <div className="mx-auto max-w-3xl space-y-8">
              {paginatedAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  isArchived={isAnnouncementArchived(announcement)}
                  isArchivePending={isArchivePending && archiveTargetId === announcement.id}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                />
              ))}

              {safePage === totalPages ? (
                <div className="pt-4 text-center">
                  <div className="mx-auto mb-8 h-1 w-16 rounded-full bg-[var(--color-primary)]/20" />
                  <p className="text-sm italic text-[var(--color-outline)]">
                    {statusFilter === "archived"
                      ? "Has llegado al final de los anuncios archivados."
                      : "Has llegado al final del tablón por hoy."}
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {!isLoading && !isError && filteredAnnouncements.length > 0 ? (
          <DashboardPagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filteredAnnouncements.length}
            itemLabel="anuncios"
            pageSize={pageSize}
            pageSizeOptions={[6, 12, 24]}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        ) : null}
      </section>

      <AnnouncementFormModal
        announcement={selectedAnnouncement}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedAnnouncement(null);
        }}
      />

      <DeleteAnnouncementModal
        announcement={selectedAnnouncement}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedAnnouncement(null);
        }}
      />
    </div>
  );
}
