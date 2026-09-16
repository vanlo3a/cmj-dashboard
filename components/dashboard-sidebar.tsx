"use client"

import { cn } from "@/lib/utils"
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Settings,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react"

export type NavKey = "overview" | "athletes" | "trends" | "upload"

const NAV_ITEMS: { key: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "athletes", label: "Athlete Database", icon: Users },
  { key: "trends", label: "Trend Analysis", icon: BarChart3 },
  { key: "upload", label: "Data Upload", icon: Upload },
]

interface DashboardSidebarProps {
  active: NavKey
  onNavigate: (key: NavKey) => void
  open: boolean
  onClose: () => void
}

export function DashboardSidebar({ active, onNavigate, open, onClose }: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-5" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-sidebar-foreground">VertLab</p>
              <p className="text-[11px] text-muted-foreground">CMJ Analytics</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn("size-[18px]", isActive ? "text-primary" : "")}
                  strokeWidth={2}
                />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto px-3 pb-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Settings className="size-[18px]" strokeWidth={2} />
            Settings
          </button>

          <div className="mt-3 flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
              DR
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-sidebar-foreground">Dr. Reyes</p>
              <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                <Activity className="size-3" /> Performance Lead
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
