"use client";

import Link from "next/link";
import { Fuel, HardHat, Send, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGasoilOverview, useEngins, useProductions } from "@/hooks/use-app-data";
import { formatNumber } from "@/lib/format";
import { useAppStore } from "@/stores/app-store";

export default function MobileAccueilPage() {
  const chantierId = useAppStore((state) => state.selectedChantierId);
  const { data: gasoil } = useGasoilOverview(chantierId);
  const { data: engins } = useEngins();
  const { data: productions = [] } = useProductions();

  return (
    <div className="space-y-4">
      <Card className="bg-[#12355b] p-5 text-white">
        <p className="text-sm font-semibold text-blue-100">Aujourd&apos;hui</p>
        <h2 className="mt-2 text-3xl font-black">Saisies terrain</h2>
        <p className="mt-2 text-sm leading-6 text-blue-100">Production, gasoil et pointage engins en quelques gestes.</p>
      </Card>

      <div className="grid gap-3">
        <Button asChild className="h-16 justify-start text-base">
          <Link href="/mobile/production/nouveau"><HardHat className="size-5" /> Saisir production</Link>
        </Button>
        <Button asChild className="h-16 justify-start bg-orange-500 text-base hover:bg-orange-600">
          <Link href="/mobile/gasoil/sortie"><Fuel className="size-5" /> Sortie gasoil</Link>
        </Button>
        <Button asChild className="h-16 justify-start text-base" variant="secondary">
          <Link href="/mobile/engins/pointage"><Truck className="size-5" /> Pointer engins</Link>
        </Button>
      </div>

      <section className="grid grid-cols-2 gap-3">
        <MobileStat label="Productions" value={String(productions.length)} />
        <MobileStat label="Gasoil sorti" value={formatNumber(gasoil?.stock.outputLiters ?? 0, "L")} />
        <MobileStat label="Engins actifs" value={String(engins?.equipment.length ?? 0)} />
        <MobileStat label="A valider" value="3" />
      </section>

      <Card className="flex items-center gap-3 p-4">
        <span className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
          <Send className="size-5" />
        </span>
        <div>
          <strong className="block text-slate-950">Synchronisation active</strong>
          <span className="text-sm text-slate-500">Mode offline prepare pour la phase suivante.</span>
        </div>
      </Card>
    </div>
  );
}

function MobileStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <strong className="mt-2 block text-2xl font-black text-slate-950">{value}</strong>
    </Card>
  );
}
