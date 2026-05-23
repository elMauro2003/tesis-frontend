import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/helpers/shadcn";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  icon?: string;
  rightElement?: ReactNode;
}

export function FormField({ 
  label, 
  id, 
  icon, 
  rightElement, 
  className, 
  ...props 
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label
        className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ml-1"
        htmlFor={id}
      >
        {label}
      </Label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-[22px]">
              {icon}
            </span>
          </div>
        )}
        <Input
          id={id}
          className={cn(
            "block w-full py-4 bg-surface-container-low border-0 shadow-none rounded-2xl text-on-surface font-medium placeholder:text-outline focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-surface-container-high transition-all outline-none",
            icon ? "pl-12" : "pl-4",
            rightElement ? "pr-12" : "pr-4",
            "h-auto", // shadcn input has fixed h-9 by default, we override it to allow py-4
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}