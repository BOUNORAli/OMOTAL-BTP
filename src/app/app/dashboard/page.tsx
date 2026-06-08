"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  Cloud,
  Database,
  FileSpreadsheet,
  Fuel,
  Gauge,
  HardHat,
  Smartphone,
  UploadCloud,
  WalletCards,
  Workflow,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

const moduleStatus = [
  { label: "Import Excel", detail: "Preview + commit", status: "Actif", tone: "green" as const, icon: FileSpreadsheet },
  { label: "Production", detail: "Decapage / Reglage / CANA", status: "Actif", tone: "green" as const, icon: HardHat },
  { label: "Mobile terrain", detail: "Brouillons locaux", status: "Pret", tone: "blue" as const, icon: Smartphone },
  { label: "Referentiels", detail: "Listes par chantier", status: "Actif", tone: "green" as const, icon: Database },
  { label: "Cloud", detail: "Vercel / Railway", status: "Configure", tone: "orange" as const, icon: Cloud },
];

const importPipeline = [
  { label: "Situation chantier", rows: "Finance, stock, gasoil", state: "Source officielle" },
  { label: "Rendements CANA", rows: "Decapage, reglage, tranchees", state: "Allocation couts" },
  { label: "Controle anomalies", rows: "#REF!, #VALUE!, doublons", state: "Bloquant si critique" },
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
            <Button asChild variant="secondary">
              <Link href="/app/imports">
                <FileSpreadsheet className="size-4" />
                Import Excel
              </Link>
            </Button>
            <Button asChild>
              <Link href="/mobile/accueil">
                <Smartphone className="size-4" />
                Terrain
              </Link>
            </Button>
          </>
        }
        description="Pilotage multi-chantiers avec reprise Excel controlee, production, gasoil, caisse et terrain mobile."
        eyebrow="OMOTAL V1 multi-chantiers"
        title="Cockpit exploitation"
      />

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard icon={<Building2 className="size-4" />} label="Chantiers" value={`${data.activeChantiers}/${data.chantiers.length}`} />
        <KpiCard
          icon={<WalletCards className="size-4" />}
          label="Depenses"
          tone="warning"
          value={formatMoney(data.totalExpenses)}
        />
        <KpiCard label="Solde caisse" tone="success" value={formatMoney(data.cashBalance)} />
        <KpiCard icon={<Fuel className="size-4" />} label="Stock gasoil" tone="blue" value={formatNumber(data.gasoilStock, "L")} />
        <KpiCard icon={<Gauge className="size-4" />} label="Validations" value={String(data.pendingValidations)} />
        <KpiCard
          icon={<AlertTriangle className="size-4" />}
          label="Alertes"
          tone={data.criticalAlerts > 0 ? "danger" : "normal"}
          value={String(data.criticalAlerts)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Charges</p>
              <h2 className="text-lg font-black text-slate-950">Depenses par categorie</h2>
            </div>
            <Badge tone="orange">Mois courant</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={expensesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatMoney(Number(value))} />
                <Bar dataKey="amount" fill="#f28c28" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Socle actif</p>
              <h2 className="text-lg font-black text-slate-950">Modules V1</h2>
            </div>
            <Badge tone="green">Multi-chantiers</Badge>
          </div>
          <div className="grid gap-2">
            {moduleStatus.map((module) => {
              const Icon = module.icon;
              return (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5" key={module.label}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <strong className="block truncate text-sm text-slate-950">{module.label}</strong>
                      <span className="block truncate text-xs text-slate-500">{module.detail}</span>
                    </div>
                  </div>
                  <Badge tone={module.tone}>{module.status}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Transition Excel</p>
              <h2 className="text-lg font-black text-slate-950">File import controlee</h2>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/app/imports">
                <UploadCloud className="size-4" />
                Ouvrir
              </Link>
            </Button>
          </div>
          <div className="grid gap-3">
            {importPipeline.map((item) => (
              <div className="grid gap-3 rounded-lg border border-slate-100 p-3 md:grid-cols-[1fr_auto]" key={item.label}>
                <div>
                  <strong className="text-sm text-slate-950">{item.label}</strong>
                  <p className="mt-1 text-xs text-slate-500">{item.rows}</p>
                </div>
                <Badge tone="blue">{item.state}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Chantiers</p>
              <h2 className="text-lg font-black text-slate-950">Vue consolidee</h2>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/app/chantiers">Liste</Link>
            </Button>
          </div>
          <div className="space-y-2">
            {data.chantiers.map((chantier) => (
              <Link
                className="block rounded-lg border border-slate-100 p-3 transition hover:border-orange-200 hover:bg-orange-50"
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
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
                  <span>
                    <strong className="block text-slate-950">{formatMoney(chantier.expensesMonth)}</strong>
                    charges
                  </span>
                  <span>
                    <strong className="block text-slate-950">{formatNumber(chantier.gasoilStock, "L")}</strong>
                    gasoil
                  </span>
                  <span>
                    <strong className="block text-slate-950">{formatNumber(chantier.production, "u")}</strong>
                    production
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-orange-700">Workflow</p>
            <h2 className="text-xl font-black text-slate-950">Operations sensibles</h2>
            <p className="mt-1 text-sm text-slate-600">Gasoil, pointage engins, production, caisse et grosses depenses.</p>
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
