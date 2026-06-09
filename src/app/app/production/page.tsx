"use client";

import { useMemo, useState } from "react";
import { BarChart3, Fuel, HardHat, Plus, Ruler, Timer } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { PageToolbar, ToolbarSelect } from "@/components/erp/page-toolbar";
import { QuantityCell, WorkflowStatus } from "@/components/erp/cells";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { ProductionForm } from "@/features/production/production-form";
import { useProductionAnalytics, useProductions } from "@/hooks/use-app-data";
import type { Production, ProductionFamily } from "@/lib/domain/types";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";

const familyLabels: Record<ProductionFamily | "ALL", string> = {
  ALL: "Toutes familles",
  DECAPAGE: "Decapage",
  REGLAGE: "Reglage",
  CANA_TRANCHEE: "CANA tranchee",
  CANA_POSE: "CANA pose",
};

const familyOptions = Object.entries(familyLabels).map(([value, label]) => ({ value, label }));

export default function ProductionPage() {
  const { data = [], isLoading } = useProductions();
  const [family, setFamily] = useState<ProductionFamily | "ALL">("ALL");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [drawerMode, setDrawerMode] = useState<"create" | "detail" | null>(null);
  const [selected, setSelected] = useState<Production | null>(null);
  const analyticsInput = family === "ALL" ? undefined : { family };
  const { data: analytics } = useProductionAnalytics(analyticsInput);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((item) => {
      const matchesFamily = family === "ALL" || item.productionFamily === family;
      const matchesStatus = status === "all" || item.status === status;
      const matchesSearch = !query || [item.voie, item.tranche ?? "", item.troncon ?? "", item.workType, item.driver ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
      return matchesFamily && matchesStatus && matchesSearch;
    });
  }, [data, family, search, status]);

  const totalQuantity = filteredRows.reduce((sum, item) => sum + item.quantity, 0);
  const totalHours = filteredRows.reduce((sum, item) => sum + (item.hours ?? 0), 0);
  const totalGasoil = filteredRows.reduce((sum, item) => sum + (item.allocatedGasoilLiters ?? 0), 0);
  const totalCost = filteredRows.reduce((sum, item) => sum + (item.totalAllocatedCost ?? 0), 0);

  const columns: DataGridColumn<Production>[] = [
    { header: "Date", cell: (row) => formatDate(row.date), sortValue: (row) => row.date, width: "110px" },
    {
      header: "Famille",
      cell: (row) => <StatusPill tone="info">{familyLabels[row.productionFamily ?? "DECAPAGE"]}</StatusPill>,
      sortValue: (row) => row.productionFamily ?? "",
    },
    {
      header: "Voie / troncon",
      cell: (row) => (
        <span>
          <strong className="block text-slate-950">{row.voie}</strong>
          <span className="text-xs text-slate-500">{row.troncon ?? row.tranche ?? "-"}</span>
        </span>
      ),
      sortValue: (row) => `${row.voie} ${row.troncon ?? ""}`,
    },
    { header: "Travail", cell: (row) => row.workType, sortValue: (row) => row.workType },
    { header: "Chauffeur", cell: (row) => row.driver ?? "-", sortValue: (row) => row.driver ?? "" },
    { header: "Quantite", align: "right", cell: (row) => <QuantityCell value={row.quantity} unit={row.unit} />, sortValue: (row) => row.quantity },
    { header: "Heures", align: "right", cell: (row) => row.hours ? `${row.hours} h` : "-", sortValue: (row) => row.hours ?? 0 },
    {
      header: "Cout/unite",
      align: "right",
      cell: (row) => row.costPerUnit ? formatMoney(row.costPerUnit) : "-",
      sortValue: (row) => row.costPerUnit ?? 0,
    },
    { header: "Statut", cell: (row) => <WorkflowStatus status={row.status} />, sortValue: (row) => row.status },
  ];

  function openDetail(row: Production) {
    setSelected(row);
    setDrawerMode("detail");
  }

  function closeDrawer() {
    setDrawerMode(null);
    setSelected(null);
  }

  return (
    <>
      <PageHeader
        actions={
          <Button onClick={() => setDrawerMode("create")} size="sm" type="button">
            <Plus className="size-4" />
            Nouvelle production
          </Button>
        }
        description="Suivi par famille, voie, engin, chauffeur, gasoil alloue, cout et statut de validation."
        eyebrow="Operations"
        title="Production"
      />

      <MetricStrip
        items={[
          { icon: HardHat, label: "Saisies", value: filteredRows.length, tone: "info" },
          { icon: Ruler, label: "Quantite", value: analytics?.totalQuantity ? formatNumber(analytics.totalQuantity, "u") : formatNumber(totalQuantity, "u"), tone: "success" },
          { icon: Timer, label: "Heures", value: formatNumber(analytics?.totalHours ?? totalHours, "h") },
          { icon: Fuel, label: "Gasoil alloue", value: formatNumber(analytics?.totalGasoilLiters ?? totalGasoil, "L"), tone: "warning" },
          { icon: BarChart3, label: "Cout total", value: formatMoney(analytics?.totalCost ?? totalCost), tone: "warning" },
          { label: "Cout/unite", value: formatNumber(analytics?.costPerUnit ?? 0, "DH/u") },
        ]}
      />

      <PageToolbar
        actions={
          <Button onClick={() => setDrawerMode("create")} size="sm" type="button" variant="secondary">
            <Plus className="size-4" />
            Saisie
          </Button>
        }
        onReset={() => {
          setFamily("ALL");
          setStatus("all");
          setSearch("");
        }}
        search={search}
        searchPlaceholder="Voie, troncon, chauffeur..."
        setSearch={setSearch}
      >
        <ToolbarSelect label="Famille production" onChange={(value) => setFamily(value as ProductionFamily | "ALL")} options={familyOptions} value={family} />
        <ToolbarSelect
          label="Statut"
          onChange={setStatus}
          options={[
            { label: "Tous statuts", value: "all" },
            { label: "Soumis", value: "soumis" },
            { label: "Valide", value: "valide" },
            { label: "Verrouille", value: "verrouille" },
            { label: "Rejete", value: "rejete" },
          ]}
          value={status}
        />
      </PageToolbar>

      <DataGrid
        columns={columns}
        isLoading={isLoading}
        onRowClick={openDetail}
        rows={filteredRows}
        selectedRowId={selected?.id}
        subtitle="Familles Decapage, Reglage et CANA"
        title="Saisies production"
      />

      <DetailDrawer onOpenChange={(open) => !open && closeDrawer()} open={drawerMode === "create"} title="Nouvelle production" width="lg">
        <ProductionForm />
      </DetailDrawer>

      <DetailDrawer
        onOpenChange={(open) => !open && closeDrawer()}
        open={drawerMode === "detail"}
        subtitle={selected ? `${selected.voie} - ${selected.troncon ?? selected.tranche ?? ""}` : undefined}
        title={selected?.workType ?? "Production"}
      >
        {selected ? (
          <div className="space-y-4">
            <MetricStrip
              items={[
                { label: "Quantite", value: formatNumber(selected.quantity, selected.unit), tone: "success" },
                { label: "Heures", value: selected.hours ? `${selected.hours} h` : "-", tone: "info" },
                { label: "Gasoil", value: formatNumber(selected.allocatedGasoilLiters ?? 0, "L"), tone: "warning" },
                { label: "Cout total", value: formatMoney(selected.totalAllocatedCost ?? 0), tone: "warning" },
              ]}
            />
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">Dimensions et allocation</h3>
              <dl className="mt-3 grid gap-2 text-sm">
                {[
                  ["Famille", familyLabels[selected.productionFamily ?? "DECAPAGE"]],
                  ["Longueur", selected.length ? formatNumber(selected.length, "m") : "-"],
                  ["Largeur", selected.width ? formatNumber(selected.width, "m") : "-"],
                  ["Profondeur", selected.depth ? formatNumber(selected.depth, "m") : "-"],
                  ["Diametre", selected.diameter ?? "-"],
                  ["Chauffeur", selected.driver ?? "-"],
                ].map(([label, value]) => (
                  <div className="flex justify-between gap-3" key={label}>
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-bold text-slate-950">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <WorkflowStatus status={selected.status} />
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
