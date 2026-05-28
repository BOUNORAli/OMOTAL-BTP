"use client";

import { Fuel, Gauge, Plus, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { KpiCard } from "@/components/domain/kpi-card";
import { StatusBadge } from "@/components/domain/status-badge";
import { GasoilSortieForm } from "@/features/gasoil/gasoil-sortie-form";
import { useGasoilOverview } from "@/hooks/use-app-data";
import type { GasoilExit } from "@/lib/domain/types";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function GasoilPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data, isLoading } = useGasoilOverview(chantierId);

  const columns: DataTableColumn<GasoilExit>[] = [
    { header: "Date", cell: (row) => formatDate(row.date) },
    { header: "BS", cell: (row) => row.exitNumber ?? "-" },
    { header: "Responsable", cell: (row) => row.responsible },
    { header: "Affectation", cell: (row) => row.allocation },
    { header: "Litres", align: "right", cell: (row) => formatNumber(row.liters, "L") },
    { header: "Montant", align: "right", cell: (row) => formatMoney(row.liters * row.unitPrice) },
    { header: "Statut", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  if (isLoading || !data) return <LoadingState />;

  return (
    <>
      <PageHeader
        actions={<Button><Plus className="size-4" /> Entree gasoil</Button>}
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
        <div>
          <CardHeader className="px-0 pt-0">
            <CardTitle>Nouvelle sortie</CardTitle>
          </CardHeader>
          <GasoilSortieForm />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sorties gasoil</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} rows={data.exits} />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
