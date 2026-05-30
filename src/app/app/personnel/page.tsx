"use client";

import { Users } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { DocumentUploader } from "@/components/domain/document-uploader";
import { KpiCard } from "@/components/domain/kpi-card";
import { EmployeeForm, PersonnelTimesheetForm } from "@/features/operations/forms";
import { usePersonnel } from "@/hooks/use-app-data";
import { calculatePersonnelAdvances, calculatePersonnelDue } from "@/lib/domain/calculations";
import type { Employee, PersonnelTimesheet } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";

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

  const timesheetColumns: DataTableColumn<PersonnelTimesheet>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    {
      header: "Employe",
      cell: (row) => {
        const employee = data.employees.find((item) => item.id === row.employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : row.employeeId;
      },
    },
    { header: "Heures", align: "right", cell: (row) => `${row.hoursWorked} h` },
    { header: "Journee", cell: (row) => row.dayType },
    { header: "Statut", cell: (row) => row.status },
    {
      header: "Justif.",
      cell: (row) => (
        <DocumentUploader
          chantierId={row.chantierId}
          compact
          module="personnel"
          targetId={row.id}
          targetType="PERSONNEL_TIMESHEET"
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        description="Employes, pointage mensuel, avances, paie et reliquats."
        eyebrow="RH chantier"
        title="Personnel"
      />
      <EmployeeForm />
      <PersonnelTimesheetForm />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <KpiCard icon={<Users className="size-4" />} label="Employes actifs" value={String(data.employees.filter((item) => item.active).length)} />
        <KpiCard label="Salaire du" tone="warning" value={formatMoney(calculatePersonnelDue(data.timesheets))} />
        <KpiCard label="Avances" tone="danger" value={formatMoney(calculatePersonnelAdvances(data.advances))} />
      </section>
      <div className="mb-4 flex flex-wrap gap-2 text-sm font-bold text-slate-600">
        {["Employes", "Pointage mensuel", "Avances", "Paie mensuelle", "Historique"].map((tab) => (
          <span className="rounded-full bg-slate-100 px-3 py-2" key={tab}>{tab}</span>
        ))}
      </div>
      <section className="space-y-6">
        <DataTable columns={columns} rows={data.employees} />
        <DataTable columns={timesheetColumns} rows={data.timesheets} />
      </section>
    </>
  );
}
