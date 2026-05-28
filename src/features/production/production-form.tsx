"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { useCreateProduction, useEngins } from "@/hooks/use-app-data";
import { productionSchema, type ProductionFormInput, type ProductionFormValues } from "@/schemas/production.schema";
import { formatNumber } from "@/lib/format";

export function ProductionForm() {
  const { data } = useEngins();
  const mutation = useCreateProduction();
  const { control, handleSubmit, register } = useForm<ProductionFormInput, unknown, ProductionFormValues>({
    resolver: zodResolver(productionSchema),
    defaultValues: {
      voie: "Voie A",
      tranche: "T1",
      troncon: "PK 0+000",
      workType: "Deblai",
      driver: "Said",
    },
  });

  const watchedDimensions = useWatch({ control, name: ["length", "width", "depth"] });
  const length = Number(watchedDimensions[0] ?? 0);
  const width = Number(watchedDimensions[1] ?? 0);
  const depth = Number(watchedDimensions[2] ?? 0);
  const quantity = depth > 0 ? length * width * depth : length * width;

  return (
    <Card className="p-5">
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => {
          mutation.mutate({
            ...values,
            quantity,
            unit: depth > 0 ? "m3" : "m2",
          });
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Voie" {...register("voie")} />
          <Input placeholder="Tranche" {...register("tranche")} />
          <Input placeholder="Troncon" {...register("troncon")} />
          <Input placeholder="Type de travail" {...register("workType")} />
          <Select {...register("equipmentId")}>
            <option value="">Engin optionnel</option>
            {data?.equipment.map((item) => (
              <option key={item.id} value={item.id}>
                {item.designation}
              </option>
            ))}
          </Select>
          <Input placeholder="Chauffeur" {...register("driver")} />
          <Input inputMode="decimal" placeholder="Longueur" type="number" {...register("length")} />
          <Input inputMode="decimal" placeholder="Largeur" type="number" {...register("width")} />
          <Input inputMode="decimal" placeholder="Profondeur si m3" type="number" {...register("depth")} />
          <Input inputMode="decimal" placeholder="Heures" type="number" {...register("hours")} />
        </div>
        <div className="rounded-2xl bg-orange-50 p-4">
          <span className="text-xs font-black uppercase tracking-wide text-orange-700">Quantite calculee</span>
          <strong className="mt-1 block text-3xl font-black text-slate-950">
            {formatNumber(quantity, depth > 0 ? "m3" : "m2")}
          </strong>
        </div>
        <Button className="w-full" disabled={mutation.isPending} type="submit">
          Soumettre la production
        </Button>
      </form>
    </Card>
  );
}
