import { cn } from "@/lib/utils";

// ── Financial table primitives ───────────────────────────────────────────────
// Numeric cells use `tabular-nums` and right alignment so columns of currency
// line up for scanning. `table-figure` marks cells that should render in the
// mono financial face.

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  /** Adds the mono figure typeface + tabular numerals */
  figure?: boolean;
  width?: string;
  /** Render cell content; defaults to the raw field value */
  render?: (row: T) => React.ReactNode;
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
}

const ALIGN = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

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
}: DataTableProps<T>) {
  const cellPad = dense ? "px-3 py-1.5" : "px-4 py-2.5";

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-charcoal-200">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  "pb-2 text-[11px] font-semibold uppercase tracking-wider text-charcoal-500",
                  cellPad,
                  ALIGN[col.align ?? "left"],
                  col.figure && "font-mono tabular-nums",
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-charcoal-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
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
