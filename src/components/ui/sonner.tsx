"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--color-surface-container-lowest)] group-[.toaster]:text-[var(--color-on-surface)] group-[.toaster]:border-[var(--color-outline-variant)] group-[.toaster]:shadow-[var(--shadow-ambient)] font-sans border ring-1 ring-black/5 rounded-xl",
          title: "font-semibold text-sm",
          description: "group-[.toast]:text-[var(--color-on-surface-variant)] text-xs",
          actionButton:
            "group-[.toast]:bg-[var(--color-primary)] group-[.toast]:text-[var(--color-on-primary)]",
          cancelButton:
            "group-[.toast]:bg-[var(--color-surface-container-high)] group-[.toast]:text-[var(--color-on-surface-variant)]",
          error: "group toast group-[.toaster]:bg-red-50 group-[.toaster]:text-[var(--color-error)] group-[.toaster]:border-red-200",
          success: "group toast group-[.toaster]:bg-emerald-50 group-[.toaster]:text-[var(--color-success)] group-[.toaster]:border-emerald-200",
          warning: "group toast group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-700 group-[.toaster]:border-amber-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
