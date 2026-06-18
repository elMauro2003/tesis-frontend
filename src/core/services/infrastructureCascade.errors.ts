export type CascadeBlockReason =
  | "assignment_history"
  | "remaining_rooms"
  | "remaining_wings"
  | "remaining_buildings";

export class CascadeDeletionBlockedError extends Error {
  readonly reason: CascadeBlockReason;
  readonly assignmentRecordCount?: number;
  readonly blockedRoomNumbers?: string[];

  constructor(
    message: string,
    options: {
      reason: CascadeBlockReason;
      assignmentRecordCount?: number;
      blockedRoomNumbers?: string[];
    }
  ) {
    super(message);
    this.name = "CascadeDeletionBlockedError";
    this.reason = options.reason;
    this.assignmentRecordCount = options.assignmentRecordCount;
    this.blockedRoomNumbers = options.blockedRoomNumbers;
  }
}

export const getCascadeErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof CascadeDeletionBlockedError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
