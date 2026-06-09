"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEngins } from "@/hooks/use-app-data";

export default function MobilePointageEnginsPage() {
  const { data } = useEngins();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase text-orange-600">Mobile terrain</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">Pointage engins</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Saisir les heures rapidement puis soumettre la journee.</p>
      </div>
      <div className="space-y-3">
        {data?.equipment.map((item) => (
          <Card className="p-4" key={item.id}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <strong className="block text-slate-950">{item.designation}</strong>
                <span className="text-sm text-slate-500">{item.usualDriver ?? "Chauffeur a renseigner"}</span>
              </div>
              <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item.billingMode}</span>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input inputMode="decimal" placeholder="Heures" type="number" />
              <Button type="button" variant="secondary">Journee</Button>
            </div>
          </Card>
        ))}
      </div>
      <Button className="h-14 w-full">
        <Send className="size-5" />
        Soumettre la journee
      </Button>
    </div>
  );
}
