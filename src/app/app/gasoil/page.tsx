"use client";

import { useMemo, useState } from "react";
import { Fuel, Gauge, Plus, Repeat2, TrendingDown, Upload } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, LoadingState } from "@/components/common/state-blocks";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { PageToolbar, ToolbarSelect } from "@/components/erp/page-toolbar";
import { MoneyCell, QuantityCell, WorkflowStatus } from "@/components/erp/cells";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { GasoilSortieForm } from "@/features/gasoil/gasoil-sortie-form";
import { GasoilEntryForm } from "@/features/operations/forms";
import { useEngins, useFournisseurs, useGasoilOverview } from "@/hooks/use-app-data";
import type { GasoilEntry, GasoilExit } from "@/lib/domain/types";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

type GasoilView = "entries" | "exits";
type DrawerState =
  | { mode: "create-entry" }
  | { mode: "create-exit" }
  | { mode: "entry-detail"; row: GasoilEntry }
  | { mode: "exit-detail"; row: GasoilExit }
  | null;

export default function GasoilPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data, error, isLoading } = useGasoilOverview(chantierId);
  const { data: fournisseurs = [] } = useFournisseurs();
  const { data: engins } = useEngins();
  const [view, setView] = useState<GasoilView>("exits");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>(null);

  const supplierNames = useMemo(() => new Map(fournisseurs.map((supplier) => [supplier.id, supplier.name])), [fournisseurs]);
  const equipmentNames = useMemo(() => new Map((engins?.equipment ?? []).map((item) => [item.id, item.designation])), [engins?.equipment]);
  const supplierName = (id: string) => supplierNames.get(id) ?? "Fournisseur non charge";
  const equipmentName = (id?: string) => id ? equipmentNames.get(id) ?? "Engin non charge" : "-";

  const filteredEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.entries ?? []).filter((entry) => {
      const matchesStatus = status === "all" || entry.status === status;
      const matchesSearch = !query || [entry.receiptNumber ?? "", supplierNames.get(entry.supplierId) ?? "", entry.liters]
        .join(" ")
        .toLowerCase()
        .includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [data?.entries, search, status, supplierNames]);

  const filteredExits = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.exits ?? []).filter((exit) => {
      const matchesStatus = status === "all" || exit.status === status;
      const matchesSearch = !query || [exit.exitNumber ?? "", exit.equipmentId ? equipmentNames.get(exit.equipmentId) ?? "" : "", exit.responsible, exit.allocation, exit.liters]
        .join(" ")
        .toLowerCase()
        .includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [data?.exits, equipmentNames, search, status]);

  const entryColumns: DataGridColumn<GasoilEntry>[] = [
    { header: "Date", cell: (row) => formatDate(row.date), sortValue: (row) => row.date },
    { header: "BR", cell: (row) => <strong className="text-slate-950">{row.receiptNumber ?? "-"}</strong>, sortValue: (row) => row.receiptNumber ?? "" },
    { header: "Fournisseur", cell: (row) => supplierName(row.supplierId), sortValue: (row) => supplierName(row.supplierId) },
    { header: "Litres", align: "right", cell: (row) => <QuantityCell value={row.liters} unit="L" />, sortValue: (row) => row.liters },
    { header: "Prix/L", align: "right", cell: (row) => formatMoney(row.unitPrice), sortValue: (row) => row.unitPrice },
    { header: "Montant", align: "right", cell: (row) => <MoneyCell amount={row.liters * row.unitPrice} />, sortValue: (row) => row.liters * row.unitPrice },
    { header: "Justif.", cell: (row) => row.hasDocument ? <StatusPill tone="success">Oui</StatusPill> : <StatusPill>Aucun</StatusPill> },
    { header: "Statut", cell: (row) => <WorkflowStatus status={row.status} />, sortValue: (row) => row.status },
  ];

  const exitColumns: DataGridColumn<GasoilExit>[] = [
    { header: "Date", cell: (row) => formatDate(row.date), sortValue: (row) => row.date },
    { header: "BS", cell: (row) => <strong className="text-slate-950">{row.exitNumber ?? "-"}</strong>, sortValue: (row) => row.exitNumber ?? "" },
    { header: "Engin", cell: (row) => equipmentName(row.equipmentId), sortValue: (row) => equipmentName(row.equipmentId) },
    { header: "Responsable", cell: (row) => row.responsible, sortValue: (row) => row.responsible },
    { header: "Affectation", cell: (row) => <StatusPill tone="info">{row.allocation}</StatusPill>, sortValue: (row) => row.allocation },
    { header: "Litres", align: "right", cell: (row) => <QuantityCell value={row.liters} unit="L" />, sortValue: (row) => row.liters },
    { header: "Montant", align: "right", cell: (row) => <MoneyCell amount={row.liters * row.unitPrice} />, sortValue: (row) => row.liters * row.unitPrice },
    { header: "Statut", cell: (row) => <WorkflowStatus status={row.status} />, sortValue: (row) => row.status },
  ];

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error instanceof Error ? error.message : "Gasoil indisponible pour le moment."} />;

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button onClick={() => setDrawer({ mode: "create-entry" })} size="sm" type="button" variant="secondary">
              <Upload className="size-4" />
              Entree
            </Button>
            <Button onClick={() => setDrawer({ mode: "create-exit" })} size="sm" type="button">
              <Plus className="size-4" />
              Sortie
            </Button>
          </>
        }
        description="Stock officiel, entrees, sorties, corrections et rapprochement avec les consommations de rendement."
        eyebrow="Operations"
        title="Gasoil"
      />

      <MetricStrip
        items={[
          { icon: Gauge, label: "Stock officiel", value: formatNumber(data.stock.stockLiters, "L"), tone: data.stock.stockLiters < 300 ? "danger" : "info" },
          { icon: Fuel, label: "Entrees", value: formatNumber(data.stock.inputLiters, "L"), tone: "success" },
          { icon: TrendingDown, label: "Sorties", value: formatNumber(data.stock.outputLiters, "L"), tone: "warning" },
          { icon: Repeat2, label: "Reconciliation", value: "A suivre", tone: "neutral" },
        ]}
      />

      <PageToolbar
        actions={
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {[
              { label: "Sorties", value: "exits" },
              { label: "Entrees", value: "entries" },
            ].map((item) => (
              <button
                className={`h-8 rounded-md px-3 text-xs font-black ${view === item.value ? "bg-[#12355b] text-white" : "text-slate-600 hover:bg-slate-50"}`}
                key={item.value}
                onClick={() => setView(item.value as GasoilView)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        }
        onReset={() => {
          setSearch("");
          setStatus("all");
          setView("exits");
        }}
        search={search}
        searchPlaceholder="Bon, engin, responsable, station..."
        setSearch={setSearch}
      >
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

      {view === "entries" ? (
        <DataGrid
          columns={entryColumns}
          onRowClick={(row) => setDrawer({ mode: "entry-detail", row })}
          rows={filteredEntries}
          selectedRowId={drawer?.mode === "entry-detail" ? drawer.row.id : undefined}
          subtitle="Source officielle du stock"
          title="Entrees gasoil"
        />
      ) : (
        <DataGrid
          columns={exitColumns}
          onRowClick={(row) => setDrawer({ mode: "exit-detail", row })}
          rows={filteredExits}
          selectedRowId={drawer?.mode === "exit-detail" ? drawer.row.id : undefined}
          subtitle="Consommations par engin, chauffeur et affectation"
          title="Sorties gasoil"
        />
      )}

      <DetailDrawer onOpenChange={(open) => !open && setDrawer(null)} open={drawer?.mode === "create-entry"} title="Nouvelle entree gasoil" width="lg">
        <GasoilEntryForm />
      </DetailDrawer>

      <DetailDrawer onOpenChange={(open) => !open && setDrawer(null)} open={drawer?.mode === "create-exit"} title="Nouvelle sortie gasoil" width="lg">
        <GasoilSortieForm />
      </DetailDrawer>

      <DetailDrawer
        onOpenChange={(open) => !open && setDrawer(null)}
        open={drawer?.mode === "entry-detail" || drawer?.mode === "exit-detail"}
        subtitle={drawer?.mode === "entry-detail" ? drawer.row.receiptNumber : drawer?.mode === "exit-detail" ? drawer.row.exitNumber : undefined}
        title={drawer?.mode === "entry-detail" ? "Detail entree gasoil" : "Detail sortie gasoil"}
      >
        {drawer?.mode === "entry-detail" ? (
          <GasoilMovementDetail
            amount={drawer.row.liters * drawer.row.unitPrice}
            date={drawer.row.date}
            liters={drawer.row.liters}
            party={supplierName(drawer.row.supplierId)}
            price={drawer.row.unitPrice}
            status={drawer.row.status}
            title="Entree stock"
          />
        ) : null}
        {drawer?.mode === "exit-detail" ? (
          <GasoilMovementDetail
            amount={drawer.row.liters * drawer.row.unitPrice}
            date={drawer.row.date}
            liters={drawer.row.liters}
            party={`${equipmentName(drawer.row.equipmentId)} - ${drawer.row.responsible}`}
            price={drawer.row.unitPrice}
            status={drawer.row.status}
            title={drawer.row.allocation}
          />
        ) : null}
      </DetailDrawer>
    </>
  );
}

function GasoilMovementDetail({
  amount,
  date,
  liters,
  party,
  price,
  status,
  title,
}: {
  amount: number;
  date: string;
  liters: number;
  party: string;
  price: number;
  status: GasoilEntry["status"];
  title: string;
}) {
  return (
    <div className="space-y-4">
      <MetricStrip
        items={[
          { label: "Litres", value: formatNumber(liters, "L"), tone: "info" },
          { label: "Prix/L", value: formatMoney(price) },
          { label: "Montant", value: formatMoney(amount), tone: "warning" },
        ]}
      />
      <div className="rounded-lg border border-slate-200 p-4">
        <h3 className="font-black text-slate-950">{title}</h3>
        <dl className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Date</dt>
            <dd className="font-bold text-slate-950">{formatDate(date)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Tiers / engin</dt>
            <dd className="font-bold text-slate-950">{party}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-500">Statut</dt>
            <dd><WorkflowStatus status={status} /></dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
