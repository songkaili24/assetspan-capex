import { cn } from "@/lib/utils";

// ── Financial table primitives ───────────────────────────────────────────────
// Numeric cells use `tabular-nums` and right alignment so columns of currency
// line up for scanning. `figure` marks cells that should render in the mono
// financial face.

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  /** Adds the mono figure typeface + tabular numerals */
  figure?: boolean;
  width?: string;
  /** Render cell content; defaults to the raw field value */
  render?: (row: T) => React.ReactNode;
  /** Enables the sort control; `value` is the comparable for this column */
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  /** Initial sort direction when this column is first activated */
  defaultDirection?: "asc" | "desc";
}

export interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  /** Stable unique key per row */
  getRowId: (row: T) => string;
  rowAction?: (row: T) => void;
  emptyMessage?: string;
  /** Dense mode for side-by-side scenario comparisons */
  dense?: boolean;
  /** Highlight rows with a subtle tint (e.g. awarded bids) */
  rowClassName?: (row: T) => string | undefined;
  footer?: React.ReactNode;
  className?: string;
  /** Controlled sort state — omit to run sorting internally */
  sort?: { key: string; direction: "asc" | "desc" };
  onSortChange?: (sort: { key: string; direction: "asc" | "desc" }) => void;
}

const ALIGN = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

function compareValues(a: string | number, b: string | number, direction: "asc" | "desc") {
  const cmp =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), "en", { numeric: true });
  return direction === "asc" ? cmp : -cmp;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  rowAction,
  emptyMessage = "No records match the current filters.",
  dense = false,
  rowClassName,
  footer,
  className,
  sort,
  onSortChange,
}: DataTableProps<T>) {
  const cellPad = dense ? "px-3 py-1.5" : "px-4 py-2.5";

  const sortedRows = (() => {
    const active = sort && columns.find((c) => c.key === sort.key && c.sortable);
    if (!active?.sortValue || !sort) return rows;
    return [...rows].sort((a, b) =>
      compareValues(active.sortValue!(a), active.sortValue!(b), sort.direction),
    );
  })();

  const toggleSort = (col: Column<T>) => {
    if (!onSortChange) return;
    if (sort?.key === col.key) {
      onSortChange({ key: col.key, direction: sort.direction === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ key: col.key, direction: col.defaultDirection ?? "asc" });
    }
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-charcoal-200">
            {columns.map((col) => {
              const isActive = sort?.key === col.key && col.sortable;
              const Arrow = ({ dir }: { dir: "asc" | "desc" }) => (
                <svg
                  className={cn("size-3", dir === "asc" ? "rotate-180" : "")}
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 4.5 6 8.5l4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              );
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={
                    isActive ? (sort!.direction === "asc" ? "ascending" : "descending") : undefined
                  }
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    "pb-2 text-[11px] font-semibold uppercase tracking-wider text-charcoal-500",
                    cellPad,
                    ALIGN[col.align ?? "left"],
                    col.figure && "font-mono tabular-nums",
                  )}
                >
                  {col.sortable && col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded transition-colors hover:text-charcoal-900",
                        isActive && "text-charcoal-900",
                      )}
                      aria-label={`Sort by ${col.header}`}
                    >
                      {col.header}
                      {isActive ? (
                        <Arrow dir={sort!.direction} />
                      ) : (
                        <span className="inline-block size-3" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-100">
          {sortedRows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-charcoal-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr
                key={getRowId(row)}
                onClick={rowAction ? () => rowAction(row) : undefined}
                className={cn(
                  "border-b border-charcoal-100 transition-colors",
                  rowAction && "cursor-pointer hover:bg-charcoal-50",
                  rowClassName?.(row),
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "text-charcoal-800",
                      cellPad,
                      ALIGN[col.align ?? "left"],
                      col.figure && "font-mono text-figure-sm tabular-nums",
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {footer && (
          <tfoot>
            <tr className="border-t-2 border-charcoal-200 bg-charcoal-50 font-medium">{footer}</tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
