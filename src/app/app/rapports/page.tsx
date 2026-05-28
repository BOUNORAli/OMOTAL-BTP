import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/common/page-header";

export default function RapportsPage() {
  return (
    <>
      <PageHeader
        description="Generation mock des rapports Excel/PDF prevus par le MVP."
        eyebrow="Exports"
        title="Rapports"
      />
      <Card className="max-w-2xl space-y-4 p-5">
        <Select defaultValue="caisse">
          <option value="caisse">Caisse mensuelle</option>
          <option value="gasoil">Gasoil mensuel</option>
          <option value="personnel">Pointage personnel</option>
          <option value="engins">Pointage engins</option>
        </Select>
        <Input defaultValue="Genie Meknes AO 62/2026" />
        <Input defaultValue="Mai 2026" />
        <Select defaultValue="excel">
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </Select>
        <Button>
          <FileSpreadsheet className="size-4" />
          Generer le rapport
        </Button>
      </Card>
    </>
  );
}
