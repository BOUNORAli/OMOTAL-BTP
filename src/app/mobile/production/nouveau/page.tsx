import { PageHeader } from "@/components/common/page-header";
import { ProductionForm } from "@/features/production/production-form";

export default function MobileProductionPage() {
  return (
    <>
      <PageHeader
        description="Parcours simplifie : localisation, engin, dimensions, quantite calculee, confirmation."
        eyebrow="Mobile terrain"
        title="Nouvelle production"
      />
      <ProductionForm />
    </>
  );
}
