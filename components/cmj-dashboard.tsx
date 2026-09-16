"use client"

import {
  athletes,
  buildMetricSummaries,
  getLatest,
  type Athlete,
} from "@/lib/cmj-data"
import { cn } from "@/lib/utils"
import { ChevronDown, Menu } from "lucide-react"
import { useMemo, useState } from "react"
import { AthleteTable } from "./athlete-table"
import { DashboardSidebar, type NavKey } from "./dashboard-sidebar"
import { MetricCards } from "./metric-cards"
import { TrendChart } from "./trend-chart"
import { UploadSection } from "./upload-section"

const PANEL_META: Record<NavKey, { title: string; description: string }> = {
  overview: {
    title: "Performance Overview",
    description: "Latest countermovement jump metrics and trends",
  },
  athletes: {
    title: "Athlete Database",
    description: "Browse and select athletes to inspect their profile",
  },
  trends: {
    title: "Trend Analysis",
    description: "Longitudinal jump performance across the testing block",
  },
  upload: {
    title: "Data Upload",
    description: "Import CSV or Excel test exports into the workspace",
  },
}

export function CmjDashboard() {
  const [nav, setNav] = useState<NavKey>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(athletes[0].id)

  const selected = useMemo<Athlete>(
    () => athletes.find((a) => a.id === selectedId) ?? athletes[0],
    [selectedId],
  )

  const metrics = useMemo(() => buildMetricSummaries(selected), [selected])

  const sparklines = useMemo(() => {
    const recent = selected.sessions.slice(-8)
    return {
      "Jump Height": recent.map((s) => s.jumpHeight),
      "Peak Force": recent.map((s) => s.peakForce),
      "Peak Power": recent.map((s) => s.peakPower),
      "RSI Modified": recent.map((s) => s.rsiModified),
    }
  }, [selected])

  const meta = PANEL_META[nav]

  function handleNavigate(key: NavKey) {
    setNav(key)
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-svh bg-background text-foreground">
      <DashboardSidebar
        active={nav}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
              {meta.title}
            </h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {meta.description}
            </p>
          </div>

          <AthleteSelector selected={selected} onSelect={setSelectedId} />
        </header>

        <main className="flex-1 space-y-6 p-4 sm:p-6">
          {nav === "overview" && (
            <>
              <AthleteHeadline athlete={selected} />
              <MetricCards metrics={metrics} sparklines={sparklines} />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <TrendChart
                  title="Jump Height"
                  subtitle="Concentric jump height over the testing block"
                  sessions={selected.sessions}
                  dataKey="jumpHeight"
                  unit="cm"
                  colorVar="--color-chart-1"
                  gradientId="grad-jh"
                />
                <TrendChart
                  title="Peak Force"
                  subtitle="Peak vertical ground reaction force"
                  sessions={selected.sessions}
                  dataKey="peakForce"
                  unit="N"
                  colorVar="--color-chart-2"
                  gradientId="grad-pf"
                />
              </div>
            </>
          )}

          {nav === "athletes" && (
            <AthleteTable
              athletes={athletes}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}

          {nav === "trends" && (
            <>
              <AthleteHeadline athlete={selected} />
              <div className="grid grid-cols-1 gap-4">
                <TrendChart
                  title="Jump Height"
                  subtitle="Concentric jump height over the testing block"
                  sessions={selected.sessions}
                  dataKey="jumpHeight"
                  unit="cm"
                  colorVar="--color-chart-1"
                  gradientId="grad-jh-2"
                />
                <TrendChart
                  title="Peak Force"
                  subtitle="Peak vertical ground reaction force"
                  sessions={selected.sessions}
                  dataKey="peakForce"
                  unit="N"
                  colorVar="--color-chart-2"
                  gradientId="grad-pf-2"
                />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <TrendChart
                    title="Peak Power"
                    subtitle="Peak concentric power output"
                    sessions={selected.sessions}
                    dataKey="peakPower"
                    unit="W"
                    colorVar="--color-chart-4"
                    gradientId="grad-pp-2"
                  />
                  <TrendChart
                    title="RSI Modified"
                    subtitle="Reactive strength index (jump height / contraction time)"
                    sessions={selected.sessions}
                    dataKey="rsiModified"
                    unit=""
                    colorVar="--color-chart-3"
                    gradientId="grad-rsi-2"
                  />
                </div>
              </div>
            </>
          )}

          {nav === "upload" && <UploadSection />}
        </main>
      </div>
    </div>
  )
}

function AthleteHeadline({ athlete }: { athlete: Athlete }) {
  const latest = getLatest(athlete)
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
          {athlete.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground">{athlete.name}</p>
          <p className="text-sm text-muted-foreground">
            {athlete.sport} · {athlete.position} · {athlete.bodyMass} kg
          </p>
        </div>
      </div>
      <div className="flex gap-6 border-t border-border pt-3 sm:border-0 sm:pt-0">
        <div>
          <p className="text-xs text-muted-foreground">Team</p>
          <p className="text-sm font-medium text-foreground">{athlete.team}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sessions</p>
          <p className="text-sm font-medium text-foreground">{athlete.sessions.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Last test</p>
          <p className="text-sm font-medium text-foreground">{latest.date}</p>
        </div>
      </div>
    </div>
  )
}

function AthleteSelector({
  selected,
  onSelect,
}: {
  selected: Athlete
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/60"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary">
          {selected.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </span>
        <span className="hidden max-w-32 truncate sm:inline">{selected.name}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 max-h-80 w-60 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-xl">
          {athletes.map((a) => (
            <button
              key={a.id}
              type="button"
              onMouseDown={() => onSelect(a.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent",
                a.id === selected.id && "bg-primary/10",
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-foreground">
                {a.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">{a.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{a.sport}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
