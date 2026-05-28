"use client";

import Link from "next/link";
import { AlertTriangle, Building2, Fuel, WalletCards, Workflow } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/common/state-blocks";
import { PageHeader } from "@/components/common/page-header";
import { KpiCard } from "@/components/domain/kpi-card";
import { useGlobalDashboard } from "@/hooks/use-app-data";
import { formatMoney, formatNumber } from "@/lib/format";

const expensesData = [
  { category: "Gasoil", amount: 11800 },
  { category: "Engins", amount: 42000 },
  { category: "Personnel", amount: 8400 },
  { category: "Divers", amount: 3200 },
];

export default function DashboardPage() {
  const { data, isLoading } = useGlobalDashboard();

  if (isLoading || !data) {
    return <LoadingState label="Preparation du tableau de bord global..." />;
  }

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button variant="secondary">Periode : Mai 2026</Button>
            <Button>Exporter</Button>
          </>
        }
        description="Vue consolidee des chantiers, depenses, gasoil, validations et alertes critiques."
        eyebrow="Direction"
        title="Tableau de bord global"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard icon={<Building2 className="size-4" />} label="Chantiers actifs" value={String(data.activeChantiers)} />
        <KpiCard
          icon={<WalletCards className="size-4" />}
          label="Depenses periode"
          tone="warning"
          value={formatMoney(data.totalExpenses)}
        />
        <KpiCard label="Solde caisse" tone="success" value={formatMoney(data.cashBalance)} />
        <KpiCard icon={<Fuel className="size-4" />} label="Stock gasoil" tone="blue" value={formatNumber(data.gasoilStock, "L")} />
        <KpiCard
          icon={<AlertTriangle className="size-4" />}
          label="Alertes critiques"
          tone={data.criticalAlerts > 0 ? "danger" : "normal"}
          value={String(data.criticalAlerts)}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Depenses par categorie</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={expensesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Bar dataKey="amount" fill="#f28c28" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chantiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.chantiers.map((chantier) => (
              <Link
                className="block rounded-2xl border border-slate-100 p-4 transition hover:border-orange-200 hover:bg-orange-50"
                href={`/app/chantiers/${chantier.id}`}
                key={chantier.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-slate-950">{chantier.name}</strong>
                    <span className="text-sm text-slate-500">{chantier.code}</span>
                  </div>
                  <Badge tone={chantier.alerts > 0 ? "orange" : "green"}>{chantier.alerts} alertes</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
                  <span>{formatMoney(chantier.expensesMonth)}</span>
                  <span>{formatNumber(chantier.gasoilStock, "L")}</span>
                  <span>{formatNumber(chantier.production, "m3/m2")}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-orange-700">Workflow</p>
            <h2 className="text-xl font-black text-slate-950">Operations a valider</h2>
            <p className="mt-1 text-sm text-slate-600">Gasoil, pointage engins, production et grosses depenses centralises.</p>
          </div>
          <Button asChild>
            <Link href="/app/validations">
              Ouvrir validations
              <Workflow className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
