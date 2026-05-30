"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { DocumentUploader } from "@/components/domain/document-uploader";
import { StatusBadge } from "@/components/domain/status-badge";
import { usePendingValidations, useRejectOperation, useValidateOperation } from "@/hooks/use-app-data";
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
  const validateMutation = useValidateOperation();
  const rejectMutation = useRejectOperation();

  function reject(row: ValidationRow) {
    const reason = window.prompt("Motif du rejet");
    if (!reason?.trim()) return;
    rejectMutation.mutate({ type: row.type, id: row.id, reason: reason.trim() });
  }

  const columns: DataTableColumn<ValidationRow>[] = [
    { header: "Type", cell: (row) => row.type },
    { header: "Chantier", cell: (row) => row.chantierId },
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "Resume", cell: (row) => <strong>{row.summary}</strong> },
    { header: "Montant/quantite", cell: (row) => row.amountOrQuantity },
    {
      header: "Justif.",
      cell: (row) => (
        <DocumentUploader
          chantierId={row.chantierId}
          compact
          module="validations"
          targetId={row.id}
          targetType={row.type}
        />
      ),
    },
    { header: "Statut", cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            disabled={validateMutation.isPending || rejectMutation.isPending}
            onClick={() => validateMutation.mutate({ type: row.type, id: row.id })}
            size="sm"
          >
            <Check className="size-4" /> Valider
          </Button>
          <Button
            disabled={validateMutation.isPending || rejectMutation.isPending}
            onClick={() => reject(row)}
            size="sm"
            variant="danger"
          >
            <X className="size-4" /> Rejeter
          </Button>
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
      {validateMutation.error ? <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{validateMutation.error.message}</p> : null}
      {rejectMutation.error ? <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{rejectMutation.error.message}</p> : null}
      {isLoading ? <LoadingState /> : <DataTable columns={columns} rows={data} />}
    </>
  );
}
