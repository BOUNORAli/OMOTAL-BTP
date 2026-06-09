"use client";

import { useState } from "react";
import { Clock3, Plus, Truck } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, LoadingState } from "@/components/common/state-blocks";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { MoneyCell, WorkflowStatus } from "@/components/erp/cells";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { EquipmentForm, EquipmentTimesheetForm } from "@/features/operations/forms";
import { useChantiers, useEngins } from "@/hooks/use-app-data";
import { calculateEquipmentCost } from "@/lib/domain/calculations";
import type { Equipment, EquipmentTimesheet } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";

type DrawerState =
  | { mode: "create-equipment" }
  | { mode: "create-timesheet" }
  | { mode: "equipment"; row: Equipment }
  | { mode: "timesheet"; row: EquipmentTimesheet }
  | null;

export default function EnginsPage() {
  const { data, error, isLoading } = useEngins();
  const { data: chantiers = [] } = useChantiers();
  const [drawer, setDrawer] = useState<DrawerState>(null);

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error instanceof Error ? error.message : "Engins indisponibles pour le moment."} />;

  const chantierName = (id: string) => chantiers.find((chantier) => chantier.id === id)?.name ?? "Chantier non charge";
  const equipmentName = (id: string) => data.equipment.find((item) => item.id === id)?.designation ?? id;

  const columns: DataGridColumn<Equipment>[] = [
    { header: "Designation", cell: (row) => <strong className="text-slate-950">{row.designation}</strong>, sortValue: (row) => row.designation },
    { header: "Type", cell: (row) => <StatusPill tone="info">{row.type}</StatusPill>, sortValue: (row) => row.type },
    { header: "Chantier", cell: (row) => chantierName(row.chantierId), sortValue: (row) => chantierName(row.chantierId) },
    { header: "Proprietaire", cell: (row) => row.owner, sortValue: (row) => row.owner },
    { header: "Facturation", cell: (row) => row.billingMode, sortValue: (row) => row.billingMode },
    { header: "Tarif", align: "right", cell: (row) => <MoneyCell amount={row.hourlyRate ?? row.dailyRate ?? 0} />, sortValue: (row) => row.hourlyRate ?? row.dailyRate ?? 0 },
    { header: "Chauffeur", cell: (row) => row.usualDriver ?? "-", sortValue: (row) => row.usualDriver ?? "" },
    { header: "Statut", cell: (row) => <StatusPill tone={row.status === "mobilise" ? "success" : "warning"}>{row.status}</StatusPill>, sortValue: (row) => row.status },
  ];

  const timesheetColumns: DataGridColumn<EquipmentTimesheet>[] = [
    { header: "Date", cell: (row) => formatDate(row.date), sortValue: (row) => row.date },
    { header: "Engin", cell: (row) => equipmentName(row.equipmentId), sortValue: (row) => equipmentName(row.equipmentId) },
    { header: "Chauffeur", cell: (row) => row.driver, sortValue: (row) => row.driver },
    { header: "Heures", align: "right", cell: (row) => row.hoursWorked ? `${row.hoursWorked} h` : "-", sortValue: (row) => row.hoursWorked ?? 0 },
    { header: "Jours", align: "right", cell: (row) => row.daysBilled ? `${row.daysBilled} j` : "-", sortValue: (row) => row.daysBilled ?? 0 },
    { header: "Activite", cell: (row) => row.activityType, sortValue: (row) => row.activityType },
    { header: "Statut", cell: (row) => <WorkflowStatus status={row.status} />, sortValue: (row) => row.status },
  ];

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button onClick={() => setDrawer({ mode: "create-equipment" })} size="sm" type="button" variant="secondary">
              <Plus className="size-4" />
              Engin
            </Button>
            <Button onClick={() => setDrawer({ mode: "create-timesheet" })} size="sm" type="button">
              <Clock3 className="size-4" />
              Pointage
            </Button>
          </>
        }
        description="Parc engins, pointages, location, gasoil consomme et rendement machine."
        eyebrow="Operations"
        title="Engins"
      />

      <MetricStrip
        items={[
          { icon: Truck, label: "Engins mobilises", value: data.equipment.length, tone: "info" },
          { icon: Clock3, label: "Pointages", value: data.timesheets.length },
          { label: "Cout location valide", value: formatMoney(calculateEquipmentCost(data.timesheets)), tone: "warning" },
        ]}
      />

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <DataGrid columns={columns} onRowClick={(row) => setDrawer({ mode: "equipment", row })} rows={data.equipment} title="Parc engins" />
        <DataGrid columns={timesheetColumns} onRowClick={(row) => setDrawer({ mode: "timesheet", row })} rows={data.timesheets} title="Pointages engins" />
      </section>

      <DetailDrawer onOpenChange={(open) => !open && setDrawer(null)} open={drawer?.mode === "create-equipment"} title="Nouvel engin" width="lg">
        <EquipmentForm />
      </DetailDrawer>
      <DetailDrawer onOpenChange={(open) => !open && setDrawer(null)} open={drawer?.mode === "create-timesheet"} title="Nouveau pointage engin" width="lg">
        <EquipmentTimesheetForm />
      </DetailDrawer>
      <DetailDrawer
        onOpenChange={(open) => !open && setDrawer(null)}
        open={drawer?.mode === "equipment" || drawer?.mode === "timesheet"}
        title={drawer?.mode === "equipment" ? drawer.row.designation : drawer?.mode === "timesheet" ? equipmentName(drawer.row.equipmentId) : "Engin"}
      >
        {drawer?.mode === "equipment" ? (
          <div className="space-y-4">
            <MetricStrip items={[{ label: "Tarif", value: formatMoney(drawer.row.hourlyRate ?? drawer.row.dailyRate ?? 0), tone: "warning" }, { label: "Statut", value: drawer.row.status, tone: drawer.row.status === "mobilise" ? "success" : "warning" }]} />
            <StatusPill tone="info">{drawer.row.owner}</StatusPill>
          </div>
        ) : null}
        {drawer?.mode === "timesheet" ? (
          <div className="space-y-4">
            <MetricStrip items={[{ label: "Heures", value: drawer.row.hoursWorked ?? "-", tone: "info" }, { label: "Jours", value: drawer.row.daysBilled ?? "-" }, { label: "Activite", value: drawer.row.activityType, tone: "warning" }]} />
            <WorkflowStatus status={drawer.row.status} />
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
