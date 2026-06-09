"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCheck, FileText, Search, X } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { PageToolbar, ToolbarSelect } from "@/components/erp/page-toolbar";
import { WorkflowStatus } from "@/components/erp/cells";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useChantiers, usePendingValidations, useRejectOperation, useValidateOperation } from "@/hooks/use-app-data";
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
  const { data: chantiers = [] } = useChantiers();
  const validateMutation = useValidateOperation();
  const rejectMutation = useRejectOperation();
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ValidationRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const chantierNames = useMemo(() => new Map(chantiers.map((chantier) => [chantier.id, chantier.name])), [chantiers]);
  const modules = useMemo(() => Array.from(new Set(data.map((row) => row.type))).sort(), [data]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((row) => {
      const matchesModule = moduleFilter === "all" || row.type === moduleFilter;
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesSearch = !query || [row.type, row.summary, row.amountOrQuantity, chantierNames.get(row.chantierId) ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
      return matchesModule && matchesStatus && matchesSearch;
    });
  }, [chantierNames, data, moduleFilter, search, statusFilter]);

  const columns: DataGridColumn<ValidationRow>[] = [
    { header: "Module", cell: (row) => <StatusPill tone="info">{row.type}</StatusPill>, sortValue: (row) => row.type },
    { header: "Chantier", cell: (row) => chantierNames.get(row.chantierId) ?? "Chantier non charge", sortValue: (row) => chantierNames.get(row.chantierId) ?? "" },
    { header: "Date", cell: (row) => formatDate(row.date), sortValue: (row) => row.date },
    {
      header: "Resume",
      cell: (row) => <strong className="text-slate-950">{row.summary}</strong>,
      sortValue: (row) => row.summary,
      width: "32%",
    },
    { header: "Montant / quantite", cell: (row) => row.amountOrQuantity, sortValue: (row) => row.amountOrQuantity },
    { header: "Justif.", cell: (row) => row.hasDocument ? <StatusPill tone="success">Present</StatusPill> : <StatusPill tone="warning">Manquant</StatusPill> },
    { header: "Statut", cell: (row) => <WorkflowStatus status={row.status} />, sortValue: (row) => row.status },
  ];

  function closeDrawer() {
    setSelected(null);
    setRejectReason("");
  }

  function validateSelected() {
    if (!selected) return;
    validateMutation.mutate({ type: selected.type, id: selected.id }, { onSuccess: closeDrawer });
  }

  function rejectSelected() {
    if (!selected || !rejectReason.trim()) return;
    rejectMutation.mutate({ type: selected.type, id: selected.id, reason: rejectReason.trim() }, { onSuccess: closeDrawer });
  }

  return (
    <>
      <PageHeader
        description="Inbox de controle avec detail operationnel avant validation ou rejet motive."
        eyebrow="Controle"
        title="Validations"
      />

      <MetricStrip
        items={[
          { icon: ClipboardCheck, label: "En attente", value: data.filter((row) => row.status === "soumis").length, tone: "warning" },
          { icon: FileText, label: "Justificatifs manquants", value: data.filter((row) => !row.hasDocument).length, tone: "danger" },
          { icon: Search, label: "Lignes filtrees", value: filteredRows.length, tone: "info" },
        ]}
      />

      <PageToolbar
        onReset={() => {
          setModuleFilter("all");
          setStatusFilter("all");
          setSearch("");
        }}
        search={search}
        searchPlaceholder="Module, chantier, resume..."
        setSearch={setSearch}
      >
        <ToolbarSelect
          label="Module"
          onChange={setModuleFilter}
          options={[{ label: "Tous modules", value: "all" }, ...modules.map((module) => ({ label: module, value: module }))]}
          value={moduleFilter}
        />
        <ToolbarSelect
          label="Statut"
          onChange={setStatusFilter}
          options={[
            { label: "Tous statuts", value: "all" },
            { label: "Soumis", value: "soumis" },
            { label: "Valide", value: "valide" },
            { label: "Rejete", value: "rejete" },
          ]}
          value={statusFilter}
        />
      </PageToolbar>

      {validateMutation.error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{validateMutation.error.message}</p> : null}
      {rejectMutation.error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{rejectMutation.error.message}</p> : null}

      {isLoading ? (
        <LoadingState />
      ) : (
        <DataGrid
          columns={columns}
          onRowClick={setSelected}
          rows={filteredRows}
          selectedRowId={selected?.id}
          subtitle="Selectionnez une operation pour consulter le detail"
          title="Inbox validation"
        />
      )}

      <DetailDrawer
        footer={
          selected ? (
            <div className="grid gap-3">
              <Textarea
                aria-label="Motif de rejet"
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Motif obligatoire en cas de rejet"
                value={rejectReason}
              />
              <div className="flex justify-end gap-2">
                <Button
                  disabled={validateMutation.isPending || rejectMutation.isPending}
                  onClick={validateSelected}
                  type="button"
                >
                  <Check className="size-4" />
                  Valider
                </Button>
                <Button
                  disabled={validateMutation.isPending || rejectMutation.isPending || !rejectReason.trim()}
                  onClick={rejectSelected}
                  type="button"
                  variant="danger"
                >
                  <X className="size-4" />
                  Rejeter
                </Button>
              </div>
            </div>
          ) : null
        }
        onOpenChange={(open) => !open && closeDrawer()}
        open={Boolean(selected)}
        subtitle={selected ? chantierNames.get(selected.chantierId) : undefined}
        title={selected?.summary ?? "Validation"}
      >
        {selected ? (
          <div className="space-y-4">
            <MetricStrip
              items={[
                { label: "Module", value: selected.type, tone: "info" },
                { label: "Valeur", value: selected.amountOrQuantity, tone: "warning" },
                { label: "Date", value: formatDate(selected.date) },
              ]}
            />
            <div className="rounded-lg border border-slate-200 p-4">
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Statut</dt>
                  <dd><WorkflowStatus status={selected.status} /></dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Justificatif</dt>
                  <dd><StatusPill tone={selected.hasDocument ? "success" : "warning"}>{selected.hasDocument ? "Present" : "Manquant"}</StatusPill></dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
