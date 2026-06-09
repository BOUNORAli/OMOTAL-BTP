"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Camera, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useCreateGasoilSortie, useEngins } from "@/hooks/use-app-data";
import { gasoilSortieSchema, type GasoilSortieFormInput, type GasoilSortieFormValues } from "@/schemas/gasoil.schema";
import { formatMoney } from "@/lib/format";

export function GasoilSortieForm({ compact = false }: { compact?: boolean }) {
  const { data } = useEngins();
  const mutation = useCreateGasoilSortie();
  const {
    formState: { errors },
    handleSubmit,
    control,
    register,
  } = useForm<GasoilSortieFormInput, unknown, GasoilSortieFormValues>({
    resolver: zodResolver(gasoilSortieSchema),
    defaultValues: {
      allocation: "production",
      responsible: "Said",
    },
  });

  const watchedLiters = useWatch({ control, name: "liters" });
  const liters = Number(watchedLiters ?? 0);
  const total = liters * 11.8;

  return (
    <Card className={compact ? "border-0 p-0 shadow-none" : "p-5"}>
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => {
          mutation.mutate(values);
        })}
      >
        <div className={compact ? "space-y-4" : "grid gap-4 md:grid-cols-2"}>
          <Field label="Engin">
            <Select {...register("equipmentId")}>
              <option value="">Choisir un engin</option>
              {data?.equipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.designation}
                </option>
              ))}
            </Select>
            {errors.equipmentId ? <Error>{errors.equipmentId.message}</Error> : null}
          </Field>
          <Field label="Litres">
            <Input inputMode="decimal" placeholder="Ex. 120" type="number" {...register("liters")} />
            {errors.liters ? <Error>{errors.liters.message}</Error> : null}
          </Field>
          <Field label="Affectation">
            <Select {...register("allocation")}>
              <option value="production">Production</option>
              <option value="etp">ETP</option>
              <option value="personnel">Personnel</option>
              <option value="transport">Transport</option>
              <option value="autre">Autre</option>
            </Select>
          </Field>
          <Field label="Chauffeur / responsable">
            <Input placeholder="Nom responsable" {...register("responsible")} />
            {errors.responsible ? <Error>{errors.responsible.message}</Error> : null}
          </Field>
        </div>

        <Field label="Observation">
          <Textarea placeholder="Optionnel : jauge, bon, remarque terrain..." {...register("observation")} />
        </Field>

        <div className="rounded-lg bg-slate-50 p-4">
          <span className="text-xs font-black uppercase text-slate-500">Montant calcule</span>
          <strong className="mt-1 block text-2xl font-black text-slate-950">{formatMoney(total)}</strong>
          <p className="mt-1 text-xs text-slate-500">Prix provisoire utilise : 11,8 DH/L. Sera remplace par prix moyen backend.</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Button type="button" variant="secondary">
            <Camera className="size-4" />
            Photo
          </Button>
          <Button type="button" variant="secondary">
            <Save className="size-4" />
            Brouillon
          </Button>
          <Button disabled={mutation.isPending} type="submit">
            <Send className="size-4" />
            Soumettre
          </Button>
        </div>

        {mutation.isSuccess ? (
          <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
            Sortie gasoil soumise. Elle apparaitra dans les validations.
          </p>
        ) : null}
      </form>
    </Card>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Error({ children }: { children: ReactNode }) {
  return <span className="text-xs font-semibold text-red-600">{children}</span>;
}
