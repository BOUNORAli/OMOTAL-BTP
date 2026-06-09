import { Card } from "@/components/ui/card";

export default function MobileHistoriquePage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase text-orange-600">Mobile terrain</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">Historique</h1>
      </div>
      {["Sortie gasoil soumise", "Pointage pelle valide", "Production voie A validee"].map((item) => (
        <Card className="p-4" key={item}>
          <strong className="block text-slate-950">{item}</strong>
          <span className="text-sm text-slate-500">Badge synchronisation : envoye</span>
        </Card>
      ))}
    </div>
  );
}
