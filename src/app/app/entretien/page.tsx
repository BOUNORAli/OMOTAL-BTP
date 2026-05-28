import { Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

export default function EntretienPage() {
  return (
    <>
      <PageHeader
        description="Module prevu pour pannes, interventions, couts entretien et immobilisations."
        eyebrow="Materiel"
        title="Entretien engins"
      />
      <Card className="p-8 text-center text-slate-600">
        <Wrench className="mx-auto mb-4 size-10 text-orange-600" />
        <strong className="block text-slate-950">Historique maintenance a venir</strong>
        <p className="mt-2">La route existe deja pour garder une architecture evolutive.</p>
      </Card>
    </>
  );
}
