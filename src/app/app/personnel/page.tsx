"use client";

import { useState } from "react";
import { Clock3, Plus, Shield, Users } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, LoadingState } from "@/components/common/state-blocks";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { MoneyCell, WorkflowStatus } from "@/components/erp/cells";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { EmployeeForm, PersonnelTimesheetForm } from "@/features/operations/forms";
import { useChantiers, usePersonnel } from "@/hooks/use-app-data";
import { calculatePersonnelAdvances, calculatePersonnelDue } from "@/lib/domain/calculations";
import { can } from "@/lib/domain/permissions";
import type { Employee, PersonnelTimesheet } from "@/lib/domain/types";
import { formatDate, formatMoney } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

type DrawerState =
  | { mode: "create-employee" }
  | { mode: "create-timesheet" }
  | { mode: "employee"; row: Employee }
  | { mode: "timesheet"; row: PersonnelTimesheet }
  | null;

export default function PersonnelPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const { data, error, isLoading } = usePersonnel();
  const { data: chantiers = [] } = useChantiers();
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const canReadSalary = can(currentUser.role, "personnel.read_salary");

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error instanceof Error ? error.message : "Personnel indisponible pour le moment."} />;

  const chantierName = (id: string) => chantiers.find((chantier) => chantier.id === id)?.name ?? "Chantier non charge";
  const employeeName = (id: string) => {
    const employee = data.employees.find((item) => item.id === id);
    return employee ? `${employee.firstName} ${employee.lastName}` : id;
  };

  const columns: DataGridColumn<Employee>[] = [
    { header: "Nom", cell: (row) => <strong className="text-slate-950">{row.firstName} {row.lastName}</strong>, sortValue: (row) => `${row.firstName} ${row.lastName}` },
    { header: "Poste", cell: (row) => row.position, sortValue: (row) => row.position },
    { header: "Chantier", cell: (row) => chantierName(row.chantierId), sortValue: (row) => chantierName(row.chantierId) },
    { header: "Type", cell: (row) => <StatusPill tone="info">{row.remunerationType}</StatusPill>, sortValue: (row) => row.remunerationType },
    {
      header: "Salaire ref.",
      align: "right",
      cell: (row) => canReadSalary ? <MoneyCell amount={row.monthlySalary ?? row.dailySalary ?? row.hourlySalary ?? 0} /> : <StatusPill>Masque</StatusPill>,
      sortValue: (row) => row.monthlySalary ?? row.dailySalary ?? row.hourlySalary ?? 0,
    },
    { header: "Statut", cell: (row) => <StatusPill tone={row.active ? "success" : "danger"}>{row.active ? "Actif" : "Inactif"}</StatusPill>, sortValue: (row) => String(row.active) },
  ];

  const timesheetColumns: DataGridColumn<PersonnelTimesheet>[] = [
    { header: "Date", cell: (row) => formatDate(row.date), sortValue: (row) => row.date },
    { header: "Employe", cell: (row) => employeeName(row.employeeId), sortValue: (row) => employeeName(row.employeeId) },
    { header: "Chantier", cell: (row) => chantierName(row.chantierId), sortValue: (row) => chantierName(row.chantierId) },
    { header: "Heures", align: "right", cell: (row) => `${row.hoursWorked} h`, sortValue: (row) => row.hoursWorked },
    { header: "Journee", cell: (row) => row.dayType, sortValue: (row) => row.dayType },
    { header: "Statut", cell: (row) => <WorkflowStatus status={row.status} />, sortValue: (row) => row.status },
  ];

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button onClick={() => setDrawer({ mode: "create-employee" })} size="sm" type="button" variant="secondary">
              <Plus className="size-4" />
              Employe
            </Button>
            <Button onClick={() => setDrawer({ mode: "create-timesheet" })} size="sm" type="button">
              <Clock3 className="size-4" />
              Pointage
            </Button>
          </>
        }
        description="Employes, pointage, avances, reste a payer et visibilite salaire selon role."
        eyebrow="Ressources"
        title="Personnel"
      />

      <MetricStrip
        items={[
          { icon: Users, label: "Employes actifs", value: data.employees.filter((item) => item.active).length, tone: "info" },
          { icon: Shield, label: "Salaire du", value: canReadSalary ? formatMoney(calculatePersonnelDue(data.timesheets)) : "Masque", tone: canReadSalary ? "warning" : "neutral" },
          { label: "Avances", value: canReadSalary ? formatMoney(calculatePersonnelAdvances(data.advances)) : "Masque", tone: canReadSalary ? "danger" : "neutral" },
        ]}
      />

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <DataGrid columns={columns} onRowClick={(row) => setDrawer({ mode: "employee", row })} rows={data.employees} title="Employes" />
        <DataGrid columns={timesheetColumns} onRowClick={(row) => setDrawer({ mode: "timesheet", row })} rows={data.timesheets} title="Pointages personnel" />
      </section>

      <DetailDrawer onOpenChange={(open) => !open && setDrawer(null)} open={drawer?.mode === "create-employee"} title="Nouvel employe" width="lg">
        <EmployeeForm />
      </DetailDrawer>
      <DetailDrawer onOpenChange={(open) => !open && setDrawer(null)} open={drawer?.mode === "create-timesheet"} title="Nouveau pointage personnel" width="lg">
        <PersonnelTimesheetForm />
      </DetailDrawer>
      <DetailDrawer
        onOpenChange={(open) => !open && setDrawer(null)}
        open={drawer?.mode === "employee" || drawer?.mode === "timesheet"}
        title={drawer?.mode === "employee" ? `${drawer.row.firstName} ${drawer.row.lastName}` : drawer?.mode === "timesheet" ? employeeName(drawer.row.employeeId) : "Personnel"}
      >
        {drawer?.mode === "employee" ? (
          <div className="space-y-4">
            <MetricStrip
              items={[
                { label: "Poste", value: drawer.row.position, tone: "info" },
                { label: "Salaire", value: canReadSalary ? formatMoney(drawer.row.monthlySalary ?? drawer.row.dailySalary ?? drawer.row.hourlySalary ?? 0) : "Masque", tone: canReadSalary ? "warning" : "neutral" },
              ]}
            />
            <StatusPill tone={drawer.row.active ? "success" : "danger"}>{drawer.row.active ? "Actif" : "Inactif"}</StatusPill>
          </div>
        ) : null}
        {drawer?.mode === "timesheet" ? (
          <div className="space-y-4">
            <MetricStrip items={[{ label: "Date", value: formatDate(drawer.row.date), tone: "info" }, { label: "Heures", value: `${drawer.row.hoursWorked} h`, tone: "warning" }, { label: "Journee", value: drawer.row.dayType }]} />
            <WorkflowStatus status={drawer.row.status} />
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
