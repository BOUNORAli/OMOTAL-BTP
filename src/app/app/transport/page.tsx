"use client";

import { Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { Badge } from "@/components/ui/badge";
import { useTransportRecords } from "@/hooks/use-app-data";
import type { TransportRecord } from "@/lib/domain/types";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function TransportPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data = [], isLoading } = useTransportRecords(chantierId);
  const total = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const columns: DataTableColumn<TransportRecord>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Designation", cell: (row) => <strong>{row.designation}</strong> },
    { header: "Depart", cell: (row) => row.departure ?? "-" },
    { header: "Arrivee", cell: (row) => row.arrival ?? "-" },
    { header: "Voyages", align: "right", cell: (row) => formatNumber(row.trips) },
    { header: "Total", align: "right", cell: (row) => formatMoney(row.totalAmount) },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "valide" ? "green" : "orange"}>{row.status}</Badge> },
  ];

  return (
    <>
      <PageHeader
        description="Voyages, transporteurs, couts et affectations par chantier."
        eyebrow="Logistique"
        title="Transport"
      />
      <Card className="mb-6 flex items-center gap-3 p-4 text-sm text-slate-600">
        <span className="rounded-xl bg-orange-50 p-2 text-orange-600">
          <Truck className="size-5" />
        </span>
        Cout transport suivi : <strong className="text-slate-950">{formatMoney(total)}</strong>
      </Card>
      <Card className="p-4">
        {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
      </Card>
    </>
  );
}
