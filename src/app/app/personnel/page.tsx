"use client";

import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { KpiCard } from "@/components/domain/kpi-card";
import { usePersonnel } from "@/hooks/use-app-data";
import { calculatePersonnelAdvances, calculatePersonnelDue } from "@/lib/domain/calculations";
import type { Employee } from "@/lib/domain/types";
import { formatMoney } from "@/lib/format";

export default function PersonnelPage() {
  const { data, isLoading } = usePersonnel();

  if (isLoading || !data) return <LoadingState />;

  const columns: DataTableColumn<Employee>[] = [
    { header: "Nom", cell: (row) => <strong>{row.firstName} {row.lastName}</strong> },
    { header: "Poste", cell: (row) => row.position },
    { header: "Type", cell: (row) => row.remunerationType },
    { header: "Salaire ref.", align: "right", cell: (row) => formatMoney(row.monthlySalary ?? row.dailySalary ?? row.hourlySalary ?? 0) },
    { header: "Statut", cell: (row) => row.active ? "Actif" : "Inactif" },
  ];

  return (
    <>
      <PageHeader
        description="Employes, pointage mensuel, avances, paie et reliquats."
        eyebrow="RH chantier"
        title="Personnel"
      />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <KpiCard icon={<Users className="size-4" />} label="Employes actifs" value={String(data.employees.filter((item) => item.active).length)} />
        <KpiCard label="Salaire du" tone="warning" value={formatMoney(calculatePersonnelDue(data.timesheets))} />
        <KpiCard label="Avances" tone="danger" value={formatMoney(calculatePersonnelAdvances(data.advances))} />
      </section>
      <Card className="p-4">
        <div className="mb-4 flex flex-wrap gap-2 text-sm font-bold text-slate-600">
          {["Employes", "Pointage mensuel", "Avances", "Paie mensuelle", "Historique"].map((tab) => (
            <span className="rounded-full bg-slate-100 px-3 py-2" key={tab}>{tab}</span>
          ))}
        </div>
        <DataTable columns={columns} rows={data.employees} />
      </Card>
    </>
  );
}
