"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileSpreadsheet,
  Fuel,
  HardHat,
  Smartphone,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataGrid, type DataGridColumn } from "@/components/common/data-grid";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, LoadingState } from "@/components/common/state-blocks";
import { DetailDrawer } from "@/components/erp/detail-drawer";
import { MetricStrip } from "@/components/erp/metric-strip";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGlobalDashboard } from "@/hooks/use-app-data";
import type { Chantier } from "@/lib/domain/types";
import { formatMoney, formatNumber } from "@/lib/format";

type DashboardChantier = Chantier & {
  expensesMonth: number;
  gasoilStock: number;
  alerts: number;
  production: number;
};

const expensesData = [
  { category: "Gasoil", amount: 11800 },
  { category: "Engins", amount: 42000 },
  { category: "Personnel", amount: 8400 },
  { category: "Divers", amount: 3200 },
];

const todayActions = [
  { label: "Imports a verifier", value: "2", href: "/app/imports", tone: "warning" as const, icon: FileSpreadsheet },
  { label: "Validations sensibles", value: "5", href: "/app/validations", tone: "danger" as const, icon: ClipboardCheck },
  { label: "Alertes critiques", value: "1", href: "/app/alertes", tone: "danger" as const, icon: AlertTriangle },
  { label: "Saisies terrain", value: "12", href: "/mobile/accueil", tone: "info" as const, icon: Smartphone },
];

export default function DashboardPage() {
  const { data, error, isLoading } = useGlobalDashboard();
  const [selected, setSelected] = useState<DashboardChantier | null>(null);

  if (isLoading) {
    return <LoadingState label="Preparation du cockpit global..." />;
  }
  if (error || !data) {
    return <ErrorState message={error instanceof Error ? error.message : "Dashboard indisponible pour le moment."} />;
  }

  const columns: DataGridColumn<DashboardChantier>[] = [
    {
      header: "Chantier",
      cell: (row) => (
        <span>
          <strong className="block text-slate-950">{row.name}</strong>
          <span className="text-xs font-semibold text-slate-500">{row.code} - {row.location}</span>
        </span>
      ),
      sortValue: (row) => row.name,
      width: "28%",
    },
    { header: "Client", cell: (row) => row.client, sortValue: (row) => row.client },
    {
      header: "Depenses",
      align: "right",
      cell: (row) => <span className="font-black text-slate-950">{formatMoney(row.expensesMonth)}</span>,
      sortValue: (row) => row.expensesMonth,
    },
    {
      header: "Gasoil",
      align: "right",
      cell: (row) => <span className="font-black text-blue-700">{formatNumber(row.gasoilStock, "L")}</span>,
      sortValue: (row) => row.gasoilStock,
    },
    {
      header: "Production",
      align: "right",
      cell: (row) => <span className="font-black text-emerald-700">{formatNumber(row.production, "u")}</span>,
      sortValue: (row) => row.production,
    },
    {
      header: "Anomalies",
      align: "center",
      cell: (row) => <StatusPill tone={row.alerts > 0 ? "warning" : "success"}>{row.alerts}</StatusPill>,
      sortValue: (row) => row.alerts,
    },
    {
      header: "Statut",
      cell: (row) => <StatusPill tone={row.status === "en_cours" ? "success" : "warning"}>{row.status}</StatusPill>,
      sortValue: (row) => row.status,
    },
  ];

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button asChild size="sm" variant="secondary">
              <Link href="/app/imports">
                <FileSpreadsheet className="size-4" />
                Imports
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/app/validations">
                <ClipboardCheck className="size-4" />
                Validations
              </Link>
            </Button>
          </>
        }
        description="Vue consolidee direction/bureau : chantiers, finance, gasoil, production, alertes et actions a traiter."
        eyebrow="Pilotage"
        title="Cockpit global"
      />

      <MetricStrip
        items={[
          { icon: Building2, label: "Chantiers actifs", value: `${data.activeChantiers}/${data.chantiers.length}`, tone: "info" },
          { icon: WalletCards, label: "Depenses", value: formatMoney(data.totalExpenses), tone: "warning" },
          { icon: CheckCircle2, label: "Solde caisse", value: formatMoney(data.cashBalance), tone: "success" },
          { icon: Fuel, label: "Stock gasoil", value: formatNumber(data.gasoilStock, "L"), tone: "info" },
          { icon: ClipboardCheck, label: "Validations", value: data.pendingValidations, tone: data.pendingValidations ? "warning" : "neutral" },
          { icon: AlertTriangle, label: "Alertes critiques", value: data.criticalAlerts, tone: data.criticalAlerts ? "danger" : "success" },
        ]}
      />

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DataGrid
          columns={columns}
          onRowClick={setSelected}
          rows={data.chantiers}
          selectedRowId={selected?.id}
          subtitle="Cliquez une ligne pour ouvrir le cockpit chantier"
          title="Comparatif multi-chantiers"
        />

        <div className="grid gap-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Actions du jour</p>
                <h2 className="text-base font-black text-slate-950">A traiter bureau</h2>
              </div>
              <StatusPill tone="warning">{todayActions.length}</StatusPill>
            </div>
            <div className="grid gap-2">
              {todayActions.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 transition hover:border-orange-300 hover:bg-orange-50"
                    href={item.href}
                    key={item.label}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
                        <Icon className="size-4" />
                      </span>
                      <strong className="truncate text-sm text-slate-950">{item.label}</strong>
                    </span>
                    <StatusPill tone={item.tone}>{item.value}</StatusPill>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Charges</p>
                <h2 className="text-base font-black text-slate-950">Depenses par categorie</h2>
              </div>
              <StatusPill tone="info">Mois</StatusPill>
            </div>
            <div className="h-64">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={expensesData}>
                  <CartesianGrid stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatMoney(Number(value))} />
                  <Bar dataKey="amount" fill="#f28c28" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Finance", value: "Caisse, fournisseurs, paiements", icon: WalletCards },
            { label: "Operations", value: "Production, engins, gasoil", icon: HardHat },
            { label: "Controle", value: "Imports, validations, rapports", icon: ClipboardCheck },
            { label: "Rentabilite", value: "BQ, couts, marges", icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2" key={item.label}>
                <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <strong className="block truncate text-sm text-slate-950">{item.label}</strong>
                  <span className="block truncate text-xs text-slate-500">{item.value}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <DetailDrawer
        onOpenChange={(open) => !open && setSelected(null)}
        open={Boolean(selected)}
        subtitle={selected ? `${selected.code} - ${selected.location}` : undefined}
        title={selected?.name ?? "Chantier"}
      >
        {selected ? (
          <div className="space-y-4">
            <MetricStrip
              items={[
                { label: "Depenses", value: formatMoney(selected.expensesMonth), tone: "warning" },
                { label: "Gasoil", value: formatNumber(selected.gasoilStock, "L"), tone: "info" },
                { label: "Production", value: formatNumber(selected.production, "u"), tone: "success" },
                { label: "Alertes", value: selected.alerts, tone: selected.alerts ? "danger" : "success" },
              ]}
            />
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">Identite chantier</h3>
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Client</dt>
                  <dd className="font-bold text-slate-950">{selected.client}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Statut</dt>
                  <dd><StatusPill tone={selected.status === "en_cours" ? "success" : "warning"}>{selected.status}</StatusPill></dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Marche HT</dt>
                  <dd className="font-bold text-slate-950">{formatMoney(selected.marketAmountHt ?? 0)}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/app/chantiers/${selected.id}`}>Ouvrir cockpit chantier</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href="/app/rapports">Exporter</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
