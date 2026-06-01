"use client";

import { Fuel, Gauge, TrendingDown } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { DocumentUploader } from "@/components/domain/document-uploader";
import { KpiCard } from "@/components/domain/kpi-card";
import { StatusBadge } from "@/components/domain/status-badge";
import { GasoilSortieForm } from "@/features/gasoil/gasoil-sortie-form";
import { GasoilEntryForm } from "@/features/operations/forms";
import { useEngins, useFournisseurs, useGasoilOverview } from "@/hooks/use-app-data";
import type { GasoilEntry, GasoilExit } from "@/lib/domain/types";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function GasoilPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data, isLoading } = useGasoilOverview(chantierId);
  const { data: fournisseurs = [] } = useFournisseurs();
  const { data: engins } = useEngins();
  const supplierName = (id: string) => fournisseurs.find((supplier) => supplier.id === id)?.name ?? "Fournisseur non charge";
  const equipmentName = (id?: string) => id ? engins?.equipment.find((item) => item.id === id)?.designation ?? "Engin non charge" : "-";

  const exitColumns: DataTableColumn<GasoilExit>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "BS", cell: (row) => row.exitNumber ?? "-" },
    { header: "Engin", cell: (row) => equipmentName(row.equipmentId) },
    { header: "Responsable", cell: (row) => row.responsible },
    { header: "Affectation", cell: (row) => row.allocation },
    { header: "Litres", align: "right", cell: (row) => formatNumber(row.liters, "L") },
    { header: "Montant", align: "right", cell: (row) => formatMoney(row.liters * row.unitPrice) },
    {
      header: "Justif.",
      cell: (row) => (
        <DocumentUploader
          chantierId={row.chantierId}
          compact
          module="gasoil"
          targetId={row.id}
          targetType="GASOIL_EXIT"
        />
      ),
    },
    { header: "Statut", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const entryColumns: DataTableColumn<GasoilEntry>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "BR", cell: (row) => row.receiptNumber ?? "-" },
    { header: "Fournisseur", cell: (row) => supplierName(row.supplierId) },
    { header: "Litres", align: "right", cell: (row) => formatNumber(row.liters, "L") },
    { header: "Montant", align: "right", cell: (row) => formatMoney(row.liters * row.unitPrice) },
    {
      header: "Justif.",
      cell: (row) => (
        <DocumentUploader
          chantierId={row.chantierId}
          compact
          module="gasoil"
          targetId={row.id}
          targetType="GASOIL_ENTRY"
        />
      ),
    },
    { header: "Statut", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  if (isLoading || !data) return <LoadingState />;

  return (
    <>
      <PageHeader
        description="Suivi des entrees, sorties, stock theorique, consommation par engin et anomalies."
        eyebrow="Carburant"
        title="Gasoil"
      />

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<Gauge className="size-4" />} label="Stock theorique" tone="blue" value={formatNumber(data.stock.stockLiters, "L")} />
        <KpiCard icon={<Fuel className="size-4" />} label="Litres entres" tone="success" value={formatNumber(data.stock.inputLiters, "L")} />
        <KpiCard icon={<TrendingDown className="size-4" />} label="Litres sortis" tone="warning" value={formatNumber(data.stock.outputLiters, "L")} />
        <KpiCard label="Prix moyen" value="11,8 DH/L" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Nouvelle entree</h2>
            <GasoilEntryForm />
          </div>
          <div>
            <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Nouvelle sortie</h2>
            <GasoilSortieForm />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Entrees gasoil</h2>
            <DataTable columns={entryColumns} rows={data.entries} />
          </div>
          <div>
            <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">Sorties gasoil</h2>
            <DataTable columns={exitColumns} rows={data.exits} />
          </div>
        </div>
      </section>
    </>
  );
}
