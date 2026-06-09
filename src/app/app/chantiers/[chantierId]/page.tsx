"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, FileText, Fuel, HardHat, Truck, Users, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState, LoadingState } from "@/components/common/state-blocks";
import { MetricStrip } from "@/components/erp/metric-strip";
import { StatusPill } from "@/components/erp/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useChantier, useChantierDashboard } from "@/hooks/use-app-data";
import { formatMoney, formatNumber } from "@/lib/format";

const cockpitSections = [
  { label: "Finance", href: "/app/caisse", icon: WalletCards },
  { label: "Gasoil", href: "/app/gasoil", icon: Fuel },
  { label: "Production", href: "/app/production", icon: HardHat },
  { label: "Personnel", href: "/app/personnel", icon: Users },
  { label: "Engins", href: "/app/engins", icon: Truck },
  { label: "Documents", href: "/app/rapports", icon: FileText },
];

export default function ChantierDetailPage() {
  const params = useParams<{ chantierId: string }>();
  const chantierId = params.chantierId;
  const { data: chantier, error: chantierError } = useChantier(chantierId);
  const { data: summary, error: summaryError, isLoading } = useChantierDashboard(chantierId);

  if (isLoading) return <LoadingState />;
  if (chantierError || summaryError || !summary || !chantier) {
    const message =
      chantierError instanceof Error
        ? chantierError.message
        : summaryError instanceof Error
          ? summaryError.message
          : "Cockpit chantier indisponible pour le moment.";
    return <ErrorState message={message} />;
  }

  return (
    <>
      <PageHeader
        actions={
          <>
            <Button asChild size="sm" variant="secondary">
              <Link href="/app/imports">Importer</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/app/production">Production</Link>
            </Button>
          </>
        }
        description={`${chantier.client} - ${chantier.location}`}
        eyebrow="Cockpit chantier"
        title={chantier.name}
      />

      <MetricStrip
        items={[
          { icon: WalletCards, label: "Solde caisse", value: formatMoney(summary.cashBalance), tone: summary.cashBalance < 0 ? "danger" : "success" },
          { icon: Fuel, label: "Stock gasoil", value: formatNumber(summary.gasoilStockLiters, "L"), tone: summary.gasoilStockLiters < 300 ? "danger" : "info" },
          { icon: Users, label: "Reste paie", value: formatMoney(summary.personnelDue - summary.personnelAdvances), tone: "warning" },
          { icon: Truck, label: "Cout engins", value: formatMoney(summary.equipmentCost), tone: "warning" },
          { icon: HardHat, label: "Production", value: formatNumber(summary.productionQuantity, "u"), tone: "success" },
          { icon: AlertTriangle, label: "Alertes", value: summary.alerts.length, tone: summary.alerts.length ? "danger" : "success" },
        ]}
      />

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-black text-slate-950">Parcours chantier</h2>
            <StatusPill tone={chantier.status === "en_cours" ? "success" : "warning"}>{chantier.status}</StatusPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cockpitSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 transition hover:border-orange-300 hover:bg-orange-50"
                  href={section.href}
                  key={section.label}
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon className="size-4" />
                  </span>
                  <strong className="text-sm text-slate-950">{section.label}</strong>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-base font-black text-slate-950">Alertes chantier</h2>
          <div className="grid gap-2">
            {summary.alerts.length ? summary.alerts.slice(0, 6).map((alert) => (
              <div className="rounded-lg border border-slate-200 px-3 py-2" key={alert.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <strong className="truncate text-sm text-slate-950">{alert.title}</strong>
                  <StatusPill tone={alert.severity === "critical" ? "danger" : alert.severity === "warning" ? "warning" : "info"}>{alert.severity}</StatusPill>
                </div>
                <p className="line-clamp-2 text-xs text-slate-500">{alert.description}</p>
              </div>
            )) : (
              <div className="rounded-lg border border-slate-200 px-3 py-6 text-center text-sm font-semibold text-slate-500">
                Aucune alerte active.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Debit caisse", value: formatMoney(summary.cashDebit), tone: "danger" as const },
          { label: "Credit caisse", value: formatMoney(summary.cashCredit), tone: "success" as const },
          { label: "Rendement", value: formatNumber(summary.productionRendement, "u/h"), tone: "info" as const },
          { label: "Cout/unite", value: formatNumber(summary.productionCostPerUnit, "DH/u"), tone: "warning" as const },
        ].map((item) => (
          <Card className="p-4" key={item.label}>
            <span className="text-xs font-black uppercase text-slate-500">{item.label}</span>
            <strong className="mt-2 block text-xl font-black text-slate-950">{item.value}</strong>
          </Card>
        ))}
      </section>
    </>
  );
}
