import { Package } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

export default function MatieresPage() {
  return <ModulePlaceholder icon={<Package className="size-6" />} title="Matieres & Fournisseurs" />;
}

function ModulePlaceholder({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <>
      <PageHeader
        description="Module prevu pour achats, fournisseurs, echeances, paiements partiels et situations."
        eyebrow="Phase suivante"
        title={title}
      />
      <Card className="p-8 text-center text-slate-600">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">{icon}</div>
        <strong className="block text-slate-950">Ecran placeholder structure</strong>
        <p className="mt-2">La route et le layout sont prets pour brancher le module sans refaire la navigation.</p>
      </Card>
    </>
  );
}
