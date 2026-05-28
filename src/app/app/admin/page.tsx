import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";

export default function AdminPage() {
  return (
    <>
      <PageHeader
        description="Utilisateurs, roles, permissions, seuils alertes, imports Excel et logs."
        eyebrow="Parametres"
        title="Administration"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Utilisateurs", "Roles et permissions", "Referentiels globaux", "Seuils alertes", "Import Excel", "Logs"].map((item) => (
          <Card className="flex items-center gap-3 p-5" key={item}>
            <span className="rounded-xl bg-slate-100 p-2 text-slate-600">
              <Settings className="size-5" />
            </span>
            <strong>{item}</strong>
          </Card>
        ))}
      </div>
    </>
  );
}
