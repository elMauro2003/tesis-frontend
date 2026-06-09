export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function validateFields<T extends string>(
  rules: Array<{ field: T; valid: boolean; message: string }>
): FieldErrors<T> | null {
  const errors: FieldErrors<T> = {};

  for (const rule of rules) {
    if (!rule.valid) {
      errors[rule.field] = rule.message;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function clearFieldError<T extends string>(
  errors: FieldErrors<T> | null,
  field: T
): FieldErrors<T> | null {
  if (!errors?.[field]) {
    return errors;
  }

  const next = { ...errors };
  delete next[field];
  return Object.keys(next).length > 0 ? next : null;
}
