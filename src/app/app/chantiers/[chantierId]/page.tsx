"use client";

import { useParams } from "next/navigation";
import { Fuel, Truck, Users, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { LoadingState } from "@/components/common/state-blocks";
import { KpiCard } from "@/components/domain/kpi-card";
import { useChantier, useChantierDashboard } from "@/hooks/use-app-data";
import { formatMoney, formatNumber } from "@/lib/format";

export default function ChantierDetailPage() {
  const params = useParams<{ chantierId: string }>();
  const chantierId = params.chantierId;
  const { data: chantier } = useChantier(chantierId);
  const { data: summary, isLoading } = useChantierDashboard(chantierId);

  if (isLoading || !summary || !chantier) return <LoadingState />;

  return (
    <>
      <PageHeader
        description={`${chantier.client} · ${chantier.location}`}
        eyebrow="Dashboard chantier"
        title={chantier.name}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<WalletCards className="size-4" />} label="Solde" tone="success" value={formatMoney(summary.cashBalance)} />
        <KpiCard icon={<Fuel className="size-4" />} label="Stock gasoil" tone="blue" value={formatNumber(summary.gasoilStockLiters, "L")} />
        <KpiCard icon={<Users className="size-4" />} label="Paie estimee" value={formatMoney(summary.personnelDue - summary.personnelAdvances)} />
        <KpiCard icon={<Truck className="size-4" />} label="Cout engins" tone="warning" value={formatMoney(summary.equipmentCost)} />
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-950">Onglets chantier prevus</h2>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-slate-600">
          {["Vue generale", "Finance", "Gasoil", "Personnel", "Engins", "Production", "Fournisseurs", "Documents", "Alertes"].map((tab) => (
            <span className="rounded-full bg-slate-100 px-3 py-2" key={tab}>{tab}</span>
          ))}
        </div>
      </section>
    </>
  );
}
