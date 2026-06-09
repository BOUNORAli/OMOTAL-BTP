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
      productionFamily: "DECAPAGE",
      voie: "Voie A",
      tranche: "T1",
      troncon: "PK 0+000",
      workType: "Deblai",
      driver: "Said",
    },
  });

  const watchedDimensions = useWatch({
    control,
    name: [
      "productionFamily",
      "length",
      "width",
      "depth",
      "allocatedGasoilAmount",
      "allocatedEquipmentCost",
      "allocatedWorkerCost",
      "allocatedDriverExpenses",
      "allocatedOtherCost",
    ],
  });
  const productionFamily = watchedDimensions[0] ?? "DECAPAGE";
  const length = Number(watchedDimensions[1] ?? 0);
  const width = Number(watchedDimensions[2] ?? 0);
  const depth = Number(watchedDimensions[3] ?? 0);
  const baseCost =
    Number(watchedDimensions[4] ?? 0) +
    Number(watchedDimensions[5] ?? 0) +
    Number(watchedDimensions[6] ?? 0) +
    Number(watchedDimensions[7] ?? 0) +
    Number(watchedDimensions[8] ?? 0);
  const overheadAmount = baseCost * 0.05;
  const totalAllocatedCost = baseCost + overheadAmount;
  const unit = productionFamily === "CANA_POSE" ? "ml" : productionFamily === "REGLAGE" ? "m2" : "m3";
  const quantity = unit === "ml" ? length : unit === "m3" ? length * width * depth : length * width;

  return (
    <Card className="p-5">
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => {
          mutation.mutate({
            ...values,
            quantity,
            unit,
            overheadAmount,
            totalAllocatedCost,
          });
        })}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Select {...register("productionFamily")}>
            <option value="DECAPAGE">Decapage / Deblai</option>
            <option value="REGLAGE">Reglage / Nivellement</option>
            <option value="CANA_TRANCHEE">CANA - Tranchee</option>
            <option value="CANA_POSE">CANA - Pose</option>
          </Select>
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
          {productionFamily === "CANA_TRANCHEE" || productionFamily === "CANA_POSE" ? (
            <>
              <Input placeholder="Diametre" {...register("diameter")} />
              <Input placeholder="Type canalisation" {...register("pipeType")} />
            </>
          ) : null}
          {productionFamily === "CANA_TRANCHEE" ? <Input placeholder="Nature sol" {...register("soilType")} /> : null}
          {productionFamily === "CANA_POSE" ? <Input placeholder="Nature pose" {...register("poseType")} /> : null}
          <Input inputMode="decimal" placeholder="Longueur" type="number" {...register("length")} />
          {unit !== "ml" ? <Input inputMode="decimal" placeholder="Largeur" type="number" {...register("width")} /> : null}
          {unit === "m3" ? <Input inputMode="decimal" placeholder="Profondeur" type="number" {...register("depth")} /> : null}
          <Input inputMode="decimal" placeholder="Heures" type="number" {...register("hours")} />
          <Input inputMode="decimal" placeholder="Gasoil L" type="number" {...register("allocatedGasoilLiters")} />
          <Input inputMode="decimal" placeholder="Cout gasoil" type="number" {...register("allocatedGasoilAmount")} />
          <Input inputMode="decimal" placeholder="Location engin" type="number" {...register("allocatedEquipmentCost")} />
          <Input inputMode="decimal" placeholder="Ouvrier" type="number" {...register("allocatedWorkerCost")} />
          <Input inputMode="decimal" placeholder="Logement chauffeur" type="number" {...register("allocatedDriverExpenses")} />
          <Input inputMode="decimal" placeholder="Autres frais" type="number" {...register("allocatedOtherCost")} />
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <span className="text-xs font-black uppercase text-orange-700">Quantite calculee</span>
          <strong className="mt-1 block text-3xl font-black text-slate-950">
            {formatNumber(quantity, unit)}
          </strong>
          <span className="mt-2 block text-sm font-semibold text-orange-800">
            Cout total alloue : {formatNumber(totalAllocatedCost, "DH")}
          </span>
        </div>
        <Button className="w-full" disabled={mutation.isPending} type="submit">
          Soumettre la production
        </Button>
      </form>
    </Card>
  );
}
