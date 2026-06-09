"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Database, FileSpreadsheet, HardHat, ShieldCheck, Upload } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { useChantiers, useCommitImport, useImportPreview } from "@/hooks/use-app-data";
import type { ImportIssue, ImportSheetPreview } from "@/lib/domain/types";
import { formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

type SheetRow = ImportSheetPreview & { id: string };
type IssueRow = ImportIssue & { id: string };

const workbookRoles = [
  { label: "Detection auto", value: "AUTO" },
  { label: "Situation chantier", value: "SITUATION" },
  { label: "Rendements / CANA", value: "RENDEMENTS" },
];

const steps = [
  { label: "Fichier", icon: Upload },
  { label: "Preview", icon: FileSpreadsheet },
  { label: "Anomalies", icon: AlertTriangle },
  { label: "Commit", icon: ShieldCheck },
];

export default function ImportsPage() {
  const selectedChantierId = useAppStore((state) => state.selectedChantierId);
  const { data: chantiers = [], isLoading } = useChantiers();
  const previewMutation = useImportPreview();
  const commitMutation = useCommitImport();
  const [file, setFile] = useState<File | null>(null);
  const [chantierId, setChantierId] = useState(selectedChantierId ?? "");
  const [workbookRole, setWorkbookRole] = useState("AUTO");
  const [selectedSheet, setSelectedSheet] = useState<SheetRow | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<IssueRow | null>(null);

  const preview = previewMutation.data;
  const activeChantierId = chantierId || selectedChantierId || chantiers[0]?.id || "";
  const issueRows = useMemo<IssueRow[]>(
    () =>
      preview?.sheets.flatMap((sheet) =>
        sheet.issues.map((issue) => ({
          ...issue,
          id: `${sheet.sheetName}-${issue.rowNumber}-${issue.message}`,
          sheetName: issue.sheetName || sheet.sheetName,
        })),
      ) ?? [],
    [preview],
  );
  const sheetRows = useMemo<SheetRow[]>(
    () => preview?.sheets.map((sheet) => ({ ...sheet, id: sheet.sheetName })) ?? [],
    [preview],
  );
  const criticalIssues = issueRows.filter((issue) => issue.severity === "CRITICAL").length;
  const activeStep = commitMutation.data ? 3 : preview ? (criticalIssues ? 2 : 1) : file ? 0 : 0;

  async function handlePreview() {
    if (!file) return;
    await previewMutation.mutateAsync({ file, workbookRole });
  }

  async function handleCommit() {
    if (!file || !activeChantierId) return;
    await commitMutation.mutateAsync({ file, chantierId: activeChantierId, workbookRole });
  }

  const sheetColumns: DataGridColumn<SheetRow>[] = [
    { header: "Feuille", cell: (row) => <strong className="text-slate-950">{row.sheetName}</strong>, sortValue: (row) => row.sheetName },
    { header: "Module", cell: (row) => <StatusPill tone="info">{row.module}</StatusPill>, sortValue: (row) => row.module },
    { header: "Lignes", align: "right", cell: (row) => row.dataRows, sortValue: (row) => row.dataRows },
    { header: "Valides", align: "right", cell: (row) => row.validRows, sortValue: (row) => row.validRows },
    { header: "Warnings", align: "right", cell: (row) => row.warningRows, sortValue: (row) => row.warningRows },
    {
      header: "Bloquees",
      align: "right",
      cell: (row) => <span className={row.blockedRows ? "font-black text-red-700" : "font-black text-slate-950"}>{row.blockedRows}</span>,
      sortValue: (row) => row.blockedRows,
    },
    {
      header: "Metriques",
      cell: (row) =>
        row.metrics.length
          ? row.metrics.map((metric) => `${metric.label}: ${formatNumber(metric.value, metric.unit)}`).join(" | ")
          : "-",
    },
  ];

  const issueColumns: DataGridColumn<IssueRow>[] = [
    { header: "Feuille", cell: (row) => row.sheetName, sortValue: (row) => row.sheetName },
    { header: "Ligne", align: "right", cell: (row) => row.rowNumber, sortValue: (row) => row.rowNumber },
    {
      header: "Severite",
      cell: (row) => <StatusPill tone={row.severity === "CRITICAL" ? "danger" : "warning"}>{row.severity}</StatusPill>,
      sortValue: (row) => row.severity,
    },
    { header: "Message", cell: (row) => <span className="font-semibold text-slate-700">{row.message}</span> },
  ];

  return (
    <>
      <PageHeader
        description="Assistant controle pour reprendre les classeurs historiques, bloquer les erreurs critiques et tracer chaque batch."
        eyebrow="Controle"
        title="Imports Excel"
      />

      <section className="mb-4 grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const done = index < activeStep || (index === 3 && Boolean(commitMutation.data));
          const active = index === activeStep;
          return (
            <div
              className={`rounded-lg border px-3 py-3 ${
                done ? "border-emerald-200 bg-emerald-50" : active ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"
              }`}
              key={step.label}
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-slate-600" />
                <strong className="text-sm text-slate-950">{index + 1}. {step.label}</strong>
              </div>
            </div>
          );
        })}
      </section>

      <Card className="mb-4 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_1fr_auto_auto]">
          <Input
            accept=".xlsx,.xls"
            aria-label="Fichier Excel"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
          <Select disabled={isLoading} onChange={(event) => setChantierId(event.target.value)} value={activeChantierId}>
            {chantiers.map((chantier) => (
              <option key={chantier.id} value={chantier.id}>
                {chantier.name}
              </option>
            ))}
          </Select>
          <Select onChange={(event) => setWorkbookRole(event.target.value)} value={workbookRole}>
            {workbookRoles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
          <Button disabled={!file || previewMutation.isPending} onClick={handlePreview} type="button" variant="secondary">
            <FileSpreadsheet className="size-4" />
            Preview
          </Button>
          <Button disabled={!file || !preview || commitMutation.isPending || !activeChantierId || criticalIssues > 0} onClick={handleCommit} type="button">
            <Upload className="size-4" />
            Commit
          </Button>
        </div>
      </Card>

      <section className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <Database className="size-5" />
            </span>
            <div>
              <strong className="block text-sm text-slate-950">Situation chantier</strong>
              <p className="mt-1 text-sm leading-6 text-slate-600">Source officielle finance, caisse, matieres, gasoil stock, ETP, transport, personnel et engins.</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-orange-50 text-orange-700">
              <HardHat className="size-5" />
            </span>
            <div>
              <strong className="block text-sm text-slate-950">Rendements / CANA</strong>
              <p className="mt-1 text-sm leading-6 text-slate-600">Production, decapage, reglage, tranchees et couts alloues sans double-compter le gasoil officiel.</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <strong className="block text-sm text-slate-950">Controle avant validation</strong>
              <p className="mt-1 text-sm leading-6 text-slate-600">#REF!, #VALUE!, doublons, dates invalides et noms proches remontent avant commit.</p>
            </div>
          </div>
        </Card>
      </section>

      {previewMutation.isPending ? <LoadingState label="Lecture du classeur..." /> : null}

      {preview ? (
        <>
          <MetricStrip
            items={[
              { icon: FileSpreadsheet, label: "Feuilles", value: preview.sheetCount, tone: "info" },
              { label: "Lignes", value: preview.totalRows },
              { icon: CheckCircle2, label: "Valides", value: preview.validRows, tone: "success" },
              { label: "Warnings", value: preview.warningRows, tone: preview.warningRows ? "warning" : "neutral" },
              { icon: AlertTriangle, label: "Bloquees", value: preview.blockedRows, tone: preview.blockedRows ? "danger" : "success" },
              { label: "Role", value: preview.workbookRole || workbookRole, tone: "info" },
            ]}
          />

          {commitMutation.data ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
              Batch {commitMutation.data.batchId} : {commitMutation.data.importedRows} lignes importees en statut {commitMutation.data.status}.
            </div>
          ) : null}

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <DataGrid
              columns={sheetColumns}
              onRowClick={setSelectedSheet}
              rows={sheetRows}
              selectedRowId={selectedSheet?.id}
              subtitle="Modules detectes, lignes valides et blocages"
              title="Preview multi-feuilles"
            />
            <DataGrid
              columns={issueColumns}
              emptyLabel="Aucune anomalie detectee."
              onRowClick={setSelectedIssue}
              rows={issueRows}
              selectedRowId={selectedIssue?.id}
              subtitle="Warnings et erreurs critiques"
              title="Anomalies"
            />
          </section>
        </>
      ) : null}

      <DetailDrawer
        onOpenChange={(open) => !open && setSelectedSheet(null)}
        open={Boolean(selectedSheet)}
        subtitle={selectedSheet?.module}
        title={selectedSheet?.sheetName ?? "Feuille"}
      >
        {selectedSheet ? (
          <div className="space-y-4">
            <MetricStrip
              items={[
                { label: "Lignes", value: selectedSheet.dataRows },
                { label: "Valides", value: selectedSheet.validRows, tone: "success" },
                { label: "Warnings", value: selectedSheet.warningRows, tone: selectedSheet.warningRows ? "warning" : "neutral" },
                { label: "Bloquees", value: selectedSheet.blockedRows, tone: selectedSheet.blockedRows ? "danger" : "success" },
              ]}
            />
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">Colonnes detectees</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedSheet.headers.map((header) => (
                  <StatusPill key={header}>{header}</StatusPill>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">Metriques</h3>
              <div className="mt-3 grid gap-2 text-sm">
                {selectedSheet.metrics.length ? selectedSheet.metrics.map((metric) => (
                  <div className="flex justify-between gap-3" key={`${metric.label}-${metric.unit}`}>
                    <span className="text-slate-500">{metric.label}</span>
                    <strong className="text-slate-950">{formatNumber(metric.value, metric.unit)}</strong>
                  </div>
                )) : <span className="text-slate-500">Aucune metrique disponible.</span>}
              </div>
            </div>
          </div>
        ) : null}
      </DetailDrawer>

      <DetailDrawer
        onOpenChange={(open) => !open && setSelectedIssue(null)}
        open={Boolean(selectedIssue)}
        subtitle={selectedIssue ? `${selectedIssue.sheetName} - ligne ${selectedIssue.rowNumber}` : undefined}
        title="Anomalie import"
      >
        {selectedIssue ? (
          <div className="space-y-4">
            <StatusPill tone={selectedIssue.severity === "CRITICAL" ? "danger" : "warning"}>{selectedIssue.severity}</StatusPill>
            <p className="rounded-lg border border-slate-200 p-4 text-sm leading-6 text-slate-700">{selectedIssue.message}</p>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
