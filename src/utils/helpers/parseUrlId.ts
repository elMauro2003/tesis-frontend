export const parseOptionalUrlId = (value: string | null): number | "all" => {
  if (!value?.trim()) {
    return "all";
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "all";
};
