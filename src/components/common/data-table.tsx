import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  className="border-b border-slate-100 px-4 py-3 text-left font-black"
                  key={column.header}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70" key={row.id}>
                {columns.map((column) => (
                  <td
                    className={`px-4 py-3 ${column.align === "right" ? "text-right" : ""} ${column.align === "center" ? "text-center" : ""}`}
                    key={column.header}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
