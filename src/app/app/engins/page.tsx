"use client";

import { Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { KpiCard } from "@/components/domain/kpi-card";
import { useEngins } from "@/hooks/use-app-data";
import { calculateEquipmentCost } from "@/lib/domain/calculations";
import type { Equipment } from "@/lib/domain/types";
import { formatMoney } from "@/lib/format";

export default function EnginsPage() {
  const { data, isLoading } = useEngins();

  if (isLoading || !data) return <LoadingState />;

  const columns: DataTableColumn<Equipment>[] = [
    { header: "Designation", cell: (row) => <strong>{row.designation}</strong> },
    { header: "Type", cell: (row) => row.type },
    { header: "Proprietaire", cell: (row) => row.owner },
    { header: "Facturation", cell: (row) => row.billingMode },
    { header: "Tarif", align: "right", cell: (row) => formatMoney(row.hourlyRate ?? row.dailyRate ?? 0) },
    { header: "Chauffeur", cell: (row) => row.usualDriver ?? "-" },
    { header: "Statut", cell: (row) => row.status },
  ];

  return (
    <>
      <PageHeader
        description="Engins, pointage, location, gasoil, paiements et rentabilite machine."
        eyebrow="Materiel"
        title="Engins"
      />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <KpiCard icon={<Truck className="size-4" />} label="Engins mobilises" value={String(data.equipment.length)} />
        <KpiCard label="Pointages" value={String(data.timesheets.length)} />
        <KpiCard label="Cout location valide" tone="warning" value={formatMoney(calculateEquipmentCost(data.timesheets))} />
      </section>
      <Card className="p-4">
        <DataTable columns={columns} rows={data.equipment} />
      </Card>
    </>
  );
}
