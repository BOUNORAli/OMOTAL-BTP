"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { StatusBadge } from "@/components/domain/status-badge";
import { usePendingValidations } from "@/hooks/use-app-data";
import type { OperationStatus } from "@/lib/domain/types";
import { formatDate } from "@/lib/format";

type ValidationRow = {
  id: string;
  type: string;
  chantierId: string;
  date: string;
  summary: string;
  amountOrQuantity: string;
  status: OperationStatus;
  hasDocument: boolean;
};

export default function ValidationsPage() {
  const { data = [], isLoading } = usePendingValidations();

  const columns: DataTableColumn<ValidationRow>[] = [
    { header: "Type", cell: (row) => row.type },
    { header: "Chantier", cell: (row) => row.chantierId },
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Resume", cell: (row) => <strong>{row.summary}</strong> },
    { header: "Montant/quantite", cell: (row) => row.amountOrQuantity },
    { header: "Justif.", cell: (row) => row.hasDocument ? "Oui" : "Non" },
    { header: "Statut", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      cell: () => (
        <div className="flex gap-2">
          <Button size="sm"><Check className="size-4" /> Valider</Button>
          <Button size="sm" variant="danger"><X className="size-4" /> Rejeter</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        description="Tout ce qui attend validation : gasoil, production, pointage engins et depenses elevees."
        eyebrow="Workflow"
        title="Validations"
      />
      {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
    </>
  );
}
