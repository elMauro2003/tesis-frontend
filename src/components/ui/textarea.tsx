import * as React from "react"

import { cn } from "@/utils/helpers/shadcn/index"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-md bg-[var(--color-surface-container-highest)] px-4 py-3 text-base transition-all placeholder-[var(--color-on-surface-variant)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 disabled:cursor-not-allowed disabled:bg-[var(--color-primary-fixed-dim)] disabled:opacity-50 md:text-sm border-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
