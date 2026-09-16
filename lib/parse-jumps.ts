import * as XLSX from "xlsx"
import type { JumpSession } from "./cmj-data"

export interface ParsedFileResult {
  fileName: string
  rows: JumpSession[]
  rowCount: number
  columns: string[]
}

/** Maps many possible header spellings to our canonical keys. */
const HEADER_ALIASES: Record<keyof JumpSession, string[]> = {
  date: ["date", "session date", "test date", "day", "timestamp"],
  jumpHeight: ["jump height", "jumpheight", "height", "jh", "jump_height", "height (cm)"],
  peakForce: ["peak force", "peakforce", "force", "pf", "peak_force", "peak force (n)"],
  peakPower: ["peak power", "peakpower", "power", "pp", "peak_power", "peak power (w)"],
  rsiModified: ["rsi modified", "rsimod", "rsi-mod", "rsi", "rsi_modified", "rsi mod"],
}

function normalize(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ")
}

function buildColumnMap(headers: string[]): Partial<Record<keyof JumpSession, string>> {
  const map: Partial<Record<keyof JumpSession, string>> = {}
  for (const header of headers) {
    const norm = normalize(header)
    for (const key of Object.keys(HEADER_ALIASES) as (keyof JumpSession)[]) {
      if (map[key]) continue
      if (HEADER_ALIASES[key].some((alias) => norm === alias || norm.includes(alias))) {
        map[key] = header
      }
    }
  }
  return map
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const n = Number.parseFloat(value.replace(/[^0-9.\-]/g, ""))
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === "number") {
    // Excel serial date
    const parsed = XLSX.SSF?.parse_date_code?.(value)
    if (parsed) {
      const mm = String(parsed.m).padStart(2, "0")
      const dd = String(parsed.d).padStart(2, "0")
      return `${parsed.y}-${mm}-${dd}`
    }
  }
  if (typeof value === "string") {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
    return value
  }
  return String(value ?? "")
}

/**
 * Parses a CSV or Excel file into normalized jump sessions.
 * Runs entirely in the browser using SheetJS.
 */
export async function parseJumpFile(file: File): Promise<ParsedFileResult> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: true,
  })

  if (json.length === 0) {
    return { fileName: file.name, rows: [], rowCount: 0, columns: [] }
  }

  const headers = Object.keys(json[0])
  const columnMap = buildColumnMap(headers)

  const rows: JumpSession[] = json.map((raw) => ({
    date: columnMap.date ? toDateString(raw[columnMap.date]) : "",
    jumpHeight: columnMap.jumpHeight ? toNumber(raw[columnMap.jumpHeight]) : 0,
    peakForce: columnMap.peakForce ? toNumber(raw[columnMap.peakForce]) : 0,
    peakPower: columnMap.peakPower ? toNumber(raw[columnMap.peakPower]) : 0,
    rsiModified: columnMap.rsiModified ? toNumber(raw[columnMap.rsiModified]) : 0,
  }))

  return {
    fileName: file.name,
    rows,
    rowCount: rows.length,
    columns: headers,
  }
}
