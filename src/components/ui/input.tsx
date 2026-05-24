import * as React from "react"

import { cn } from "@/utils/helpers/shadcn/index"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md bg-[var(--color-surface-container-highest)] px-4 py-2 text-base transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder-[var(--color-on-surface-variant)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(0,55,176,0.4)] disabled:cursor-not-allowed disabled:bg-[var(--color-primary-fixed-dim)] disabled:opacity-50 md:text-sm border-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
