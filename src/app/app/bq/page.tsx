import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

export default function BqPage() {
  return (
    <>
      <PageHeader
        description="Module protege pour BQ, prix de revient, cout reel et marge."
        eyebrow="Rentabilite"
        title="BQ & Rentabilite"
      />
      <Card className="p-8 text-center text-slate-600">
        <TrendingUp className="mx-auto mb-4 size-10 text-orange-600" />
        <strong className="block text-slate-950">Colonnes sensibles masquees selon role</strong>
        <p className="mt-2">Ce module sera branche apres la stabilisation production et couts reels.</p>
      </Card>
    </>
  );
}
