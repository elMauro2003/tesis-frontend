import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/helpers/shadcn/index"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-fixed disabled:pointer-events-none disabled:bg-primary-fixed-dim disabled:text-on-surface-variant [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer font-label text-label-caps",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-primary-btn)] hover:bg-[var(--color-primary-hover)] rounded-lg",
        destructive:
          "bg-[var(--color-error)] text-white shadow-sm hover:opacity-90",
        outline:
          "border-ghost bg-[var(--color-surface-container-lowest)] hover:bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)]",
        secondary:
          "bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] hover:bg-opacity-80",
        ghost: "hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2", /* Taller touch targets based on premium feel */
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
