"use client";

import { ReactNode } from "react";
import { DashboardEmptyState } from "@/components/shared/DashboardEmptyState";

interface TableEmptyStateProps {
  colSpan: number;
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: ReactNode;
}

export function TableEmptyState({
  colSpan,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryAction,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10">
        <DashboardEmptyState
          title={title}
          description={description}
          icon={icon}
          actionLabel={actionLabel}
          onAction={onAction}
          secondaryAction={secondaryAction}
        />
      </td>
    </tr>
  );
}

export default TableEmptyState;