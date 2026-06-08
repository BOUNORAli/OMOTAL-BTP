"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { KpiCard } from "@/components/domain/kpi-card";
import { useChantiers, useCommitImport, useImportPreview } from "@/hooks/use-app-data";
import type { ImportIssue, ImportSheetPreview } from "@/lib/domain/types";
import { formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function ImportsPage() {
  const selectedChantierId = useAppStore((state) => state.selectedChantierId);
  const { data: chantiers = [], isLoading } = useChantiers();
  const previewMutation = useImportPreview();
  const commitMutation = useCommitImport();
  const [file, setFile] = useState<File | null>(null);
  const [chantierId, setChantierId] = useState(selectedChantierId ?? "");
  const [workbookRole, setWorkbookRole] = useState("AUTO");

  const preview = previewMutation.data;
  const activeChantierId = chantierId || selectedChantierId || chantiers[0]?.id || "";
  const issues = useMemo(
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
  const sheetRows = useMemo(
    () => preview?.sheets.map((sheet) => ({ ...sheet, id: sheet.sheetName })) ?? [],
    [preview],
  );

  async function handlePreview() {
    if (!file) return;
    await previewMutation.mutateAsync({ file, workbookRole });
  }

  async function handleCommit() {
    if (!file || !activeChantierId) return;
    await commitMutation.mutateAsync({ file, chantierId: activeChantierId, workbookRole });
  }

  const sheetColumns: DataTableColumn<ImportSheetPreview & { id: string }>[] = [
    { header: "Feuille", cell: (row) => row.sheetName },
    { header: "Module", cell: (row) => <Badge>{row.module}</Badge> },
    { header: "Lignes", align: "right", cell: (row) => row.dataRows },
    { header: "Valides", align: "right", cell: (row) => row.validRows },
    { header: "Alertes", align: "right", cell: (row) => row.warningRows },
    { header: "Bloquees", align: "right", cell: (row) => row.blockedRows },
    {
      header: "Metriques",
      cell: (row) =>
        row.metrics.length
          ? row.metrics.map((metric) => `${metric.label}: ${formatNumber(metric.value, metric.unit)}`).join(" | ")
          : "-",
    },
  ];

  const issueColumns: DataTableColumn<ImportIssue & { id: string }>[] = [
    { header: "Feuille", cell: (row) => row.sheetName },
    { header: "Ligne", align: "right", cell: (row) => row.rowNumber },
    {
      header: "Severite",
      cell: (row) => <Badge tone={row.severity === "CRITICAL" ? "red" : "orange"}>{row.severity}</Badge>,
    },
    { header: "Message", cell: (row) => row.message },
  ];

  return (
    <>
      <PageHeader
        description="Reprise Excel multi-feuilles avec controle des anomalies, totaux et journal d'import."
        eyebrow="Transition Excel"
        title="Imports controles"
      />

      <Card className="mb-6 p-5">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto]">
          <Input
            accept=".xlsx,.xls"
            aria-label="Fichier Excel"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          <Select disabled={isLoading} value={activeChantierId} onChange={(event) => setChantierId(event.target.value)}>
            {chantiers.map((chantier) => (
              <option key={chantier.id} value={chantier.id}>
                {chantier.name}
              </option>
            ))}
          </Select>
          <Select value={workbookRole} onChange={(event) => setWorkbookRole(event.target.value)}>
            <option value="AUTO">Detection auto</option>
            <option value="SITUATION">Situation chantier</option>
            <option value="RENDEMENTS">Rendements / CANA</option>
          </Select>
          <Button disabled={!file || previewMutation.isPending} onClick={handlePreview}>
            <FileSpreadsheet className="size-4" />
            Apercu
          </Button>
          <Button disabled={!file || !preview || commitMutation.isPending || !activeChantierId} onClick={handleCommit}>
            <Upload className="size-4" />
            Importer
          </Button>
        </div>
      </Card>

      {previewMutation.isPending ? <LoadingState label="Lecture du classeur..." /> : null}

      {preview ? (
        <>
          <section className="mb-6 grid gap-4 md:grid-cols-5">
            <KpiCard icon={<FileSpreadsheet className="size-4" />} label="Feuilles" value={String(preview.sheetCount)} />
            <KpiCard label="Lignes" value={String(preview.totalRows)} />
            <KpiCard icon={<CheckCircle2 className="size-4" />} label="Valides" tone="success" value={String(preview.validRows)} />
            <KpiCard label="Alertes" tone="warning" value={String(preview.warningRows)} />
            <KpiCard
              icon={<AlertTriangle className="size-4" />}
              label="Bloquees"
              tone={preview.blockedRows > 0 ? "danger" : "normal"}
              value={String(preview.blockedRows)}
            />
          </section>

          {commitMutation.data ? (
            <Card className="mb-6 border-green-200 bg-green-50 p-4">
              <strong className="text-sm text-green-900">
                Import {commitMutation.data.status} : {commitMutation.data.importedRows} lignes importees.
              </strong>
            </Card>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-4">
              <DataTable columns={sheetColumns} rows={sheetRows} />
            </Card>
            <Card className="p-4">
              {issues.length ? <DataTable columns={issueColumns} rows={issues} /> : <p className="text-sm font-semibold text-slate-500">Aucune anomalie bloquante detectee.</p>}
            </Card>
          </section>
        </>
      ) : null}
    </>
  );
}
