"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { NAV_ITEMS } from "./nav-config";
import { cn } from "@/lib/utils";
import { CloseIcon } from "./icons";

export interface SidebarNavProps {
  /** Vertical rail on desktop; slide-over drawer content on mobile */
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
          Navigate
        </span>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="rounded-md p-1.5 text-charcoal-400 hover:bg-charcoal-100 hover:text-charcoal-700"
          >
            <CloseIcon className="size-5" />
          </button>
        )}
      </div>

      <ul className="flex-1 space-y-0.5 px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-charcoal-900 text-white"
                    : "text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-900",
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] shrink-0",
                    active ? "text-gold-400" : "text-charcoal-400",
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.annotation && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums",
                      active
                        ? "bg-charcoal-800 text-gold-400"
                        : "bg-charcoal-100 text-charcoal-500",
                    )}
                  >
                    {item.annotation}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-charcoal-200 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-charcoal-400">
          Reserve Account
        </p>
        <p className="mt-0.5 font-mono text-figure-sm tabular-nums text-charcoal-800">
          $18.4M funded · 96% target
        </p>
      </div>
    </nav>
  );
}
