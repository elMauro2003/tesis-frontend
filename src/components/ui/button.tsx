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
          "border border-transparent bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-primary-btn)] hover:brightness-95 hover:shadow-[0_12px_24px_rgba(0,55,176,0.22)] rounded-lg",
        primary:
          "border border-transparent bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-primary-btn)] hover:brightness-95 hover:shadow-[0_12px_24px_rgba(0,55,176,0.22)] rounded-lg",
        confirm:
          "border border-transparent bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-primary-btn)] hover:brightness-95 hover:shadow-[0_12px_24px_rgba(0,55,176,0.22)] rounded-lg",
        add:
          "border border-transparent bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-primary-btn)] hover:brightness-95 hover:shadow-[0_12px_24px_rgba(0,55,176,0.22)] rounded-lg",
        destructive:
          "bg-[var(--color-error)] text-white shadow-sm hover:bg-[#a31515]",
        danger:
          "bg-[var(--color-error)] text-white shadow-sm hover:bg-[#a31515]",
        outline:
          "border-ghost bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary-dark)]",
        neutral:
          "border-ghost bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary-dark)]",
        cancel:
          "border-ghost bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary-dark)]",
        secondary:
          "bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-primary-dark)]",
        success:
          "bg-[var(--color-success)] text-white shadow-sm hover:bg-[#15803d]",
        ghost: "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary-dark)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:text-[var(--color-primary-dark)] hover:underline",
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
