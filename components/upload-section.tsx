"use client"

import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/cmj-data"
import { parseJumpFile, type ParsedFileResult } from "@/lib/parse-jumps"
import {
  CheckCircle2,
  FileSpreadsheet,
  FileWarning,
  Loader2,
  UploadCloud,
} from "lucide-react"
import { useCallback, useRef, useState } from "react"

const ACCEPTED = ".csv,.xlsx,.xls"

export function UploadSection() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ParsedFileResult | null>(null)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const valid = /\.(csv|xlsx|xls)$/i.test(file.name)
    if (!valid) {
      setError("Unsupported file type. Please upload a .csv, .xlsx, or .xls file.")
      setResult(null)
      return
    }
    setError(null)
    setBusy(true)
    try {
      const parsed = await parseJumpFile(file)
      if (parsed.rowCount === 0) {
        setError("No rows found in this file. Check that it has a header row and data.")
        setResult(null)
      } else {
        setResult(parsed)
      }
    } catch {
      setError("Something went wrong reading that file. Please try again.")
      setResult(null)
    } finally {
      setBusy(false)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          void handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-12",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/50",
        )}
      >
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary">
          {busy ? (
            <Loader2 className="size-7 animate-spin" />
          ) : (
            <UploadCloud className="size-7" strokeWidth={2} />
          )}
        </div>
        <p className="mt-4 text-sm font-medium text-foreground">
          {busy ? "Processing your file…" : "Drag & drop your test export here"}
        </p>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">
          Upload CSV or Excel exports from your force plate or jump mat. Columns for date, jump
          height, peak force, peak power and RSI-modified are detected automatically.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          <FileSpreadsheet className="size-4" />
          Browse files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <p className="mt-3 text-[11px] text-muted-foreground">Supported: .csv, .xlsx, .xls</p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <FileWarning className="mt-0.5 size-5 shrink-0 text-destructive" />
          <p className="text-sm text-foreground">{error}</p>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <CheckCircle2 className="size-5 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{result.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {result.rowCount} rows parsed · {result.columns.length} columns detected
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 text-right font-medium">Jump (cm)</th>
                  <th className="px-4 py-2.5 text-right font-medium">Peak Force (N)</th>
                  <th className="px-4 py-2.5 text-right font-medium">Peak Power (W)</th>
                  <th className="px-4 py-2.5 text-right font-medium">RSI-mod</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 8).map((row, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {/\d{4}-\d{2}-\d{2}/.test(row.date) ? formatDate(row.date) : row.date || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                      {row.jumpHeight || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                      {row.peakForce ? row.peakForce.toLocaleString("en-US") : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                      {row.peakPower ? row.peakPower.toLocaleString("en-US") : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-foreground">
                      {row.rsiModified || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.rowCount > 8 && (
            <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
              Showing first 8 of {result.rowCount} rows
            </p>
          )}
        </div>
      )}
    </div>
  )
}
