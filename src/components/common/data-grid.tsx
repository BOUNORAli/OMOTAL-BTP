"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface DataGridColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  sortValue?: (row: T) => string | number | Date | null | undefined;
  width?: string;
}

export function DataGrid<T extends { id: string }>({
  columns,
  emptyLabel = "Aucune donnee disponible pour ces filtres.",
  footer,
  isLoading,
  onRowClick,
  rows,
  selectedRowId,
  subtitle,
  title,
}: {
  columns: DataGridColumn<T>[];
  emptyLabel?: string;
  footer?: ReactNode;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  rows: T[];
  selectedRowId?: string;
  subtitle?: string;
  title?: string;
}) {
  const [sort, setSort] = useState<{ header: string; direction: "asc" | "desc" } | null>(null);
  const sortableHeaders = useMemo(
    () => new Set(columns.filter((column) => column.sortValue).map((column) => column.header)),
    [columns],
  );
  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((item) => item.header === sort.header);
    if (!column?.sortValue) return rows;

    return [...rows].sort((a, b) => {
      const left = normalizeSortValue(column.sortValue?.(a));
      const right = normalizeSortValue(column.sortValue?.(b));
      if (left < right) return sort.direction === "asc" ? -1 : 1;
      if (left > right) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [columns, rows, sort]);

  function toggleSort(header: string) {
    if (!sortableHeaders.has(header)) return;
    setSort((current) =>
      current?.header === header
        ? { header, direction: current.direction === "asc" ? "desc" : "asc" }
        : { header, direction: "asc" },
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {title || subtitle ? (
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            {title ? <h2 className="truncate text-sm font-black text-slate-950">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{subtitle}</p> : null}
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">{rows.length}</span>
        </header>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              {columns.map((column) => {
                const sorted = sort?.header === column.header;
                const sortable = sortableHeaders.has(column.header);
                return (
                  <th
                    className={cn(
                      "border-b border-slate-200 px-3 py-2 text-left font-black",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                      sortable && "cursor-pointer select-none",
                      column.className,
                    )}
                    key={column.header}
                    onClick={() => toggleSort(column.header)}
                    style={{ width: column.width }}
                  >
                    <span className={cn("inline-flex items-center gap-1", column.align === "right" && "justify-end")}>
                      {column.header}
                      {sorted ? (
                        sort.direction === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : null}
                    </span>
                  </th>
                );
              })}
              {onRowClick ? <th className="w-10 border-b border-slate-200 px-2 py-2" /> : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-8 text-center text-sm font-semibold text-slate-500" colSpan={columns.length + (onRowClick ? 1 : 0)}>
                  Chargement...
                </td>
              </tr>
            ) : null}
            {!isLoading && sortedRows.length === 0 ? (
              <tr>
                <td className="px-3 py-10 text-center" colSpan={columns.length + (onRowClick ? 1 : 0)}>
                  <Inbox className="mx-auto mb-2 size-7 text-slate-300" />
                  <span className="text-sm font-semibold text-slate-500">{emptyLabel}</span>
                </td>
              </tr>
            ) : null}
            {!isLoading
              ? sortedRows.map((row) => (
                  <tr
                    className={cn(
                      "border-b border-slate-100 last:border-0",
                      onRowClick && "cursor-pointer hover:bg-orange-50/60",
                      selectedRowId === row.id && "bg-orange-50",
                    )}
                    key={row.id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((column) => (
                      <td
                        className={cn(
                          "px-3 py-2.5 align-middle text-slate-700",
                          column.align === "right" && "text-right",
                          column.align === "center" && "text-center",
                          column.className,
                        )}
                        key={column.header}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                    {onRowClick ? (
                      <td className="px-2 py-2.5 text-right">
                        <Button aria-label="Ouvrir le detail" size="sm" type="button" variant="ghost">
                          <ChevronRight className="size-4" />
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
      {footer ? <footer className="border-t border-slate-200 bg-slate-50 px-4 py-3">{footer}</footer> : null}
    </section>
  );
}

function normalizeSortValue(value: string | number | Date | null | undefined) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  return String(value ?? "").toLowerCase();
}
