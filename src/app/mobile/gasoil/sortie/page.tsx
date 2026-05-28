import { PageHeader } from "@/components/common/page-header";
import { GasoilSortieForm } from "@/features/gasoil/gasoil-sortie-form";

export default function MobileGasoilSortiePage() {
  return (
    <>
      <PageHeader
        description="Champs limites au strict necessaire : engin, litres, affectation, photo et observation."
        eyebrow="Mobile terrain"
        title="Sortie gasoil"
      />
      <GasoilSortieForm compact />
    </>
  );
}
