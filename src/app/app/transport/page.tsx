import { Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

export default function TransportPage() {
  return (
    <>
      <PageHeader
        description="Module prevu pour voyages, transporteurs, couts et exports mensuels."
        eyebrow="Phase suivante"
        title="Transport"
      />
      <Card className="p-8 text-center text-slate-600">
        <Truck className="mx-auto mb-4 size-10 text-orange-600" />
        <strong className="block text-slate-950">Structure prete</strong>
        <p className="mt-2">Les composants table/formulaire seront ajoutes apres stabilisation caisse, gasoil et pointage.</p>
      </Card>
    </>
  );
}
