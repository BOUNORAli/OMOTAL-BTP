"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";
import { useChantiers } from "@/hooks/use-app-data";
import { dataSource } from "@/services/data-source";
import { useAppStore } from "@/stores/app-store";

type ReportType = "caisse" | "gasoil" | "personnel" | "engins" | "dashboard";

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
      downloadBlob(blob, `${reportType}-${activeChantier?.code ?? activeChantierId}-${from}-${to}.xlsx`);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Export impossible pour le moment.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <>
      <PageHeader
        description="Exports Excel propres avec chantier, periode, utilisateur generateur et totaux."
        eyebrow="Exports"
        title="Rapports"
      />
      <Card className="max-w-2xl space-y-4 p-5">
        <Select value={reportType} onChange={(event) => setReportType(event.target.value as ReportType)}>
          <option value="caisse">Caisse mensuelle</option>
          <option value="gasoil">Gasoil mensuel</option>
          <option value="personnel">Pointage personnel</option>
          <option value="engins">Pointage engins</option>
          <option value="dashboard">Synthese dashboard</option>
        </Select>
        <Select
          disabled={isLoading}
          value={activeChantierId ?? ""}
          onChange={(event) => setChantierId(event.target.value)}
        >
          {chantiers.map((chantier) => (
            <option key={chantier.id} value={chantier.id}>
              {chantier.name}
            </option>
          ))}
        </Select>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input aria-label="Date debut" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          <Input aria-label="Date fin" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
        <Select value={onlyValidated ? "validated" : "all"} onChange={(event) => setOnlyValidated(event.target.value === "validated")}>
          <option value="validated">Donnees validees uniquement</option>
          <option value="all">Inclure brouillons et soumis</option>
        </Select>
        {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
        <Button disabled={isExporting || !activeChantierId} onClick={handleExport}>
          {isExporting ? <FileSpreadsheet className="size-4 animate-pulse" /> : <Download className="size-4" />}
          {isExporting ? "Generation..." : "Telecharger le fichier .xlsx"}
        </Button>
      </Card>
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
