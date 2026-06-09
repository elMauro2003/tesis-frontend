import { cn } from "@/utils/helpers/shadcn/index";

interface FormFieldErrorProps {
  message?: string;
  className?: string;
}

export function FormFieldError({ message, className }: FormFieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={cn("ml-1 text-xs font-medium text-error", className)} role="alert">
      {message}
    </p>
  );
}
