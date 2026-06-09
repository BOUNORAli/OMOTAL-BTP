"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, History, ShieldCheck } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { MetricStrip } from "@/components/erp/metric-strip";
import { PageToolbar, ToolbarSelect } from "@/components/erp/page-toolbar";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useChantiers } from "@/hooks/use-app-data";
import { dataSource } from "@/services/data-source";
import { useAppStore } from "@/stores/app-store";

type ReportType = "caisse" | "gasoil" | "personnel" | "engins" | "dashboard";

type ExportHistory = {
  id: string;
  type: ReportType;
  chantier: string;
  period: string;
  scope: string;
  fileName: string;
};

const reportTypes: Array<{ label: string; value: ReportType; module: string }> = [
  { label: "Caisse mensuelle", value: "caisse", module: "Finance" },
  { label: "Gasoil mensuel", value: "gasoil", module: "Operations" },
  { label: "Pointage personnel", value: "personnel", module: "Ressources" },
  { label: "Pointage engins", value: "engins", module: "Ressources" },
  { label: "Synthese dashboard", value: "dashboard", module: "Pilotage" },
];

export default function RapportsPage() {
  const { data: chantiers = [], isLoading } = useChantiers();
  const selectedChantierId = useAppStore((state) => state.selectedChantierId);
  const [reportType, setReportType] = useState<ReportType>("caisse");
  const [chantierId, setChantierId] = useState(selectedChantierId);
  const [from, setFrom] = useState("2026-05-01");
  const [to, setTo] = useState("2026-05-31");
  const [onlyValidated, setOnlyValidated] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ExportHistory[]>([]);

  const activeChantierId = chantierId || chantiers[0]?.id || selectedChantierId;
  const activeChantier = useMemo(
    () => chantiers.find((chantier) => chantier.id === activeChantierId),
    [activeChantierId, chantiers],
  );

  async function handleExport() {
    if (!activeChantierId) {
      setError("Choisir un chantier avant de generer le rapport.");
      return;
    }

    setIsExporting(true);
    setError(null);
    try {
      const blob = await dataSource.exportService.download({
        type: reportType,
        chantierId: activeChantierId,
        from,
        to,
        onlyValidated,
      });
      const fileName = `${reportType}-${activeChantier?.code ?? activeChantierId}-${from}-${to}.xlsx`;
      downloadBlob(blob, fileName);
      setHistory((items) => [
        {
          id: `${Date.now()}-${fileName}`,
          chantier: activeChantier?.name ?? activeChantierId,
          fileName,
          period: `${from} - ${to}`,
          scope: onlyValidated ? "Validees uniquement" : "Toutes donnees",
          type: reportType,
        },
        ...items,
      ]);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Export impossible pour le moment.");
    } finally {
      setIsExporting(false);
    }
  }

  const historyColumns: DataGridColumn<ExportHistory>[] = [
    { header: "Type", cell: (row) => <StatusPill tone="info">{row.type}</StatusPill>, sortValue: (row) => row.type },
    { header: "Chantier", cell: (row) => row.chantier, sortValue: (row) => row.chantier },
    { header: "Periode", cell: (row) => row.period, sortValue: (row) => row.period },
    { header: "Portee", cell: (row) => row.scope, sortValue: (row) => row.scope },
    { header: "Fichier", cell: (row) => <strong className="text-slate-950">{row.fileName}</strong>, sortValue: (row) => row.fileName },
  ];

  return (
    <>
      <PageHeader
        description="Centre d'exports Excel par chantier, periode et module, pour controle, comptabilite et archivage."
        eyebrow="Controle"
        title="Rapports"
      />

      <MetricStrip
        items={[
          { icon: FileSpreadsheet, label: "Exports", value: reportTypes.length, tone: "info" },
          { icon: ShieldCheck, label: "Mode", value: onlyValidated ? "Valide" : "Tout" },
          { icon: History, label: "Historique session", value: history.length, tone: "warning" },
        ]}
      />

      <section className="mt-4 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-black text-slate-950">Nouvel export</h2>
          <div className="grid gap-3">
            <Select onChange={(event) => setReportType(event.target.value as ReportType)} value={reportType}>
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            <Select disabled={isLoading} onChange={(event) => setChantierId(event.target.value)} value={activeChantierId ?? ""}>
              {chantiers.map((chantier) => (
                <option key={chantier.id} value={chantier.id}>
                  {chantier.name}
                </option>
              ))}
            </Select>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input aria-label="Date debut" onChange={(event) => setFrom(event.target.value)} type="date" value={from} />
              <Input aria-label="Date fin" onChange={(event) => setTo(event.target.value)} type="date" value={to} />
            </div>
            <Select onChange={(event) => setOnlyValidated(event.target.value === "validated")} value={onlyValidated ? "validated" : "all"}>
              <option value="validated">Donnees validees uniquement</option>
              <option value="all">Inclure brouillons et soumis</option>
            </Select>
            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
            <Button disabled={isExporting || !activeChantierId} onClick={handleExport} type="button">
              {isExporting ? <FileSpreadsheet className="size-4 animate-pulse" /> : <Download className="size-4" />}
              {isExporting ? "Generation..." : "Telecharger .xlsx"}
            </Button>
          </div>
        </section>

        <section>
          <PageToolbar>
            <ToolbarSelect
              label="Type"
              onChange={(value) => setReportType(value as ReportType)}
              options={reportTypes.map((type) => ({ label: type.label, value: type.value }))}
              value={reportType}
            />
          </PageToolbar>
          <DataGrid columns={historyColumns} emptyLabel="Aucun export genere dans cette session." rows={history} title="Historique d'exports" />
        </section>
      </section>
    </>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
