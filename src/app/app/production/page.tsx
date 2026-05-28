"use client";

import { HardHat } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { KpiCard } from "@/components/domain/kpi-card";
import { StatusBadge } from "@/components/domain/status-badge";
import { ProductionForm } from "@/features/production/production-form";
import { useProductions } from "@/hooks/use-app-data";
import type { Production } from "@/lib/domain/types";
import { formatDate, formatNumber } from "@/lib/format";

export default function ProductionPage() {
  const { data = [], isLoading } = useProductions();

  const columns: DataTableColumn<Production>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Voie", cell: (row) => row.voie },
    { header: "Troncon", cell: (row) => row.troncon ?? "-" },
    { header: "Travail", cell: (row) => row.workType },
    { header: "Quantite", align: "right", cell: (row) => formatNumber(row.quantity, row.unit) },
    { header: "Heures", align: "right", cell: (row) => row.hours ?? "-" },
    { header: "Statut", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const totalQuantity = data.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <PageHeader
        description="Saisies terrain, synthese jour/voie/engin, quantites et rendements."
        eyebrow="Terrain"
        title="Production & rendements"
      />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <KpiCard icon={<HardHat className="size-4" />} label="Saisies production" value={String(data.length)} />
        <KpiCard label="Quantite totale" tone="success" value={formatNumber(totalQuantity, "m3/m2")} />
        <KpiCard label="En attente" tone="warning" value={String(data.filter((item) => item.status === "soumis").length)} />
      </section>
      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <ProductionForm />
        <Card className="p-4">{isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}</Card>
      </section>
    </>
  );
}
