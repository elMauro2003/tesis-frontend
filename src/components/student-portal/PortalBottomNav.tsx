"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTAL_NAV_ITEMS } from "@/configs/permissions";
import { cn } from "@/utils/helpers/shadcn/index";

export function PortalBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/10 bg-surface-container-lowest/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,55,176,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-2 md:max-w-2xl">
        {PORTAL_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors",
                active ? "text-primary" : "text-on-surface-variant hover:text-primary"
              )}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className={cn("text-[10px] font-semibold", active && "font-bold")}>
                {item.label}
              </span>
              {active ? <span className="h-0.5 w-6 rounded-full bg-primary" /> : <span className="h-0.5 w-6" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
