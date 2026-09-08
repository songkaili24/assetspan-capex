/**
 * Client-side CSV export: builds a file from rows and triggers a download.
 * Values are escaped per RFC 4180 and prefixed with a BOM so Excel opens
 * UTF-8 currency symbols correctly.
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>,
) {
  const escape = (value: string | number) => {
    const s = String(value);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const content = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join(
    "\r\n",
  );

  const blob = new Blob([`\uFEFF${content}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
