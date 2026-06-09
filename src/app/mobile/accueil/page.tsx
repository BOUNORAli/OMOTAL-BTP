"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Fuel, HardHat, History, Send, Signal, Truck, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/erp/status-pill";
import { useEngins, useGasoilOverview, useProductions } from "@/hooks/use-app-data";
import { formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function MobileAccueilPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data: gasoil } = useGasoilOverview(chantierId);
  const { data: engins } = useEngins();
  const { data: productions = [] } = useProductions();

  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-[#12355b] p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-blue-100">Aujourd&apos;hui</p>
            <h2 className="mt-1 text-2xl font-black">Terrain mobile</h2>
          </div>
          <span className="rounded-lg bg-white/10 p-2 text-blue-100">
            <Signal className="size-5" />
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <MobileStat label="Production" value={String(productions.length)} inverse />
          <MobileStat label="Gasoil sorti" value={formatNumber(gasoil?.stock.outputLiters ?? 0, "L")} inverse />
        </div>
      </section>

      <div className="grid gap-2">
        <Button asChild className="h-14 justify-start text-base">
          <Link href="/mobile/production/nouveau"><HardHat className="size-5" /> Production</Link>
        </Button>
        <Button asChild className="h-14 justify-start bg-orange-500 text-base hover:bg-orange-600">
          <Link href="/mobile/gasoil/sortie"><Fuel className="size-5" /> Sortie gasoil</Link>
        </Button>
        <Button asChild className="h-14 justify-start text-base" variant="secondary">
          <Link href="/mobile/engins/pointage"><Truck className="size-5" /> Pointage engins</Link>
        </Button>
        <Button asChild className="h-12 justify-start text-base" variant="secondary">
          <Link href="/mobile/historique"><History className="size-5" /> Historique</Link>
        </Button>
      </div>

      <section className="grid grid-cols-2 gap-2">
        <MobileStat label="Engins actifs" value={String(engins?.equipment.length ?? 0)} />
        <MobileStat label="A valider" value="3" />
      </section>

      <section className="grid gap-2">
        <Card className="flex items-center justify-between gap-3 p-3">
          <span className="flex items-center gap-3">
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Send className="size-5" />
            </span>
            <strong className="text-sm text-slate-950">Synchronisation</strong>
          </span>
          <StatusPill tone="success">Active</StatusPill>
        </Card>
        <div className="grid grid-cols-2 gap-2">
          <MobileStatus icon={<WifiOff className="size-4" />} label="Offline" value="Brouillon" />
          <MobileStatus icon={<CheckCircle2 className="size-4" />} label="Reseau" value="Sync auto" />
        </div>
      </section>
    </div>
  );
}

function MobileStat({ inverse, label, value }: { inverse?: boolean; label: string; value: string }) {
  return (
    <div className={inverse ? "rounded-lg bg-white/10 p-3" : "rounded-lg border border-slate-200 bg-white p-3"}>
      <span className={inverse ? "text-xs font-bold uppercase text-blue-100" : "text-xs font-bold uppercase text-slate-500"}>{label}</span>
      <strong className={inverse ? "mt-1 block text-xl font-black text-white" : "mt-1 block text-xl font-black text-slate-950"}>{value}</strong>
    </div>
  );
}

function MobileStatus({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-2 p-3">
      <span className="rounded-lg bg-slate-100 p-2 text-slate-700">{icon}</span>
      <span className="min-w-0">
        <strong className="block truncate text-sm text-slate-950">{label}</strong>
        <span className="block truncate text-xs text-slate-500">{value}</span>
      </span>
    </Card>
  );
}
