"use client";

import { Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { useMaintenanceRecords } from "@/hooks/use-app-data";
import type { MaintenanceRecord } from "@/lib/domain/types";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function EntretienPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data = [], isLoading } = useMaintenanceRecords(chantierId);
  const total = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const stopped = data.filter((item) => item.immobilized).length;
  const columns: DataTableColumn<MaintenanceRecord>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Intervention", cell: (row) => <strong>{row.interventionType}</strong> },
    { header: "Designation", cell: (row) => row.designation },
    { header: "Quantite", align: "right", cell: (row) => formatNumber(row.quantity) },
    { header: "Total", align: "right", cell: (row) => formatMoney(row.totalAmount) },
    { header: "Immobilisation", cell: (row) => row.immobilized ? `${row.downtimeDays ?? 0} j` : "-" },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "valide" ? "green" : "orange"}>{row.status}</Badge> },
  ];

  return (
    <>
      <PageHeader
        description="Pannes, interventions, couts entretien et immobilisations."
        eyebrow="Materiel"
        title="Entretien engins"
      />
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="flex items-center gap-3 p-4 text-sm text-slate-600">
          <span className="rounded-xl bg-orange-50 p-2 text-orange-600">
            <Wrench className="size-5" />
          </span>
          Cout entretien : <strong className="text-slate-950">{formatMoney(total)}</strong>
        </Card>
        <Card className="p-4 text-sm text-slate-600">
          Engins immobilises : <strong className="text-slate-950">{stopped}</strong>
        </Card>
      </section>
      <Card className="p-4">
        {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
      </Card>
    </>
  );
}
