export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => string | number | null | undefined);
}

export interface ExportOptions {
  filename?: string;
  delimiter?: string;
}

export function generateCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions = {}
): string {
  const { delimiter = "," } = options;

  const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = columns.map((col) => escapeCSV(col.header)).join(delimiter);

  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value =
          typeof col.accessor === "function"
            ? col.accessor(row)
            : row[col.accessor];
        return escapeCSV(value);
      })
      .join(delimiter)
  );

  return [headers, ...rows].join("\n");
}

export function downloadCSV(csv: string, filename: string = "export.csv"): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0] ?? "";
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toISOString().replace("T", " ").split(".")[0] ?? "";
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
