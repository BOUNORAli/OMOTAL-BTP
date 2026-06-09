import type { ReactNode } from "react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  sortValue?: (row: T) => string | number | Date | null | undefined;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
}) {
  return <DataGrid columns={columns as DataGridColumn<T>[]} rows={rows} />;
}
