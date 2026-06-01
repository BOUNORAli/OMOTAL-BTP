"use client";

import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { DocumentUploader } from "@/components/domain/document-uploader";
import { KpiCard } from "@/components/domain/kpi-card";
import { StatusBadge } from "@/components/domain/status-badge";
import { EquipmentForm, EquipmentTimesheetForm } from "@/features/operations/forms";
import { useChantiers, useEngins } from "@/hooks/use-app-data";
import { calculateEquipmentCost } from "@/lib/domain/calculations";
import type { Equipment, EquipmentTimesheet } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";

export default function EnginsPage() {
  const { data, isLoading } = useEngins();
  const { data: chantiers = [] } = useChantiers();

  if (isLoading || !data) return <LoadingState />;

  const chantierName = (id: string) => chantiers.find((chantier) => chantier.id === id)?.name ?? "Chantier non charge";

  const columns: DataTableColumn<Equipment>[] = [
    { header: "Designation", cell: (row) => <strong>{row.designation}</strong> },
    { header: "Type", cell: (row) => row.type },
    { header: "Chantier", cell: (row) => chantierName(row.chantierId) },
    { header: "Proprietaire", cell: (row) => row.owner },
    { header: "Facturation", cell: (row) => row.billingMode },
    { header: "Tarif", align: "right", cell: (row) => formatMoney(row.hourlyRate ?? row.dailyRate ?? 0) },
    { header: "Chauffeur", cell: (row) => row.usualDriver ?? "-" },
    { header: "Statut", cell: (row) => <Badge tone={row.status === "mobilise" ? "green" : "orange"}>{row.status}</Badge> },
  ];

  const timesheetColumns: DataTableColumn<EquipmentTimesheet>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    {
      header: "Engin",
      cell: (row) => data.equipment.find((item) => item.id === row.equipmentId)?.designation ?? row.equipmentId,
    },
    { header: "Chantier", cell: (row) => chantierName(row.chantierId) },
    { header: "Chauffeur", cell: (row) => row.driver },
    { header: "Heures", align: "right", cell: (row) => row.hoursWorked ? `${row.hoursWorked} h` : "-" },
    { header: "Jours", align: "right", cell: (row) => row.daysBilled ? `${row.daysBilled} j` : "-" },
    { header: "Activite", cell: (row) => row.activityType },
    { header: "Statut", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Justif.",
      cell: (row) => (
        <DocumentUploader
          chantierId={row.chantierId}
          compact
          module="engins"
          targetId={row.id}
          targetType="EQUIPMENT_TIMESHEET"
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        description="Engins, pointage, location, gasoil, paiements et rentabilite machine."
        eyebrow="Materiel"
        title="Engins"
      />
      <EquipmentForm />
      <EquipmentTimesheetForm />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <KpiCard icon={<Truck className="size-4" />} label="Engins mobilises" value={String(data.equipment.length)} />
        <KpiCard label="Pointages" value={String(data.timesheets.length)} />
        <KpiCard label="Cout location valide" tone="warning" value={formatMoney(calculateEquipmentCost(data.timesheets))} />
      </section>
      <section className="space-y-6">
        <DataTable columns={columns} rows={data.equipment} />
        <DataTable columns={timesheetColumns} rows={data.timesheets} />
      </section>
    </>
  );
}
