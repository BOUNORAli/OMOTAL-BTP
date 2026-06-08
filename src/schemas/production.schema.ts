import { z } from "zod";

export const productionSchema = z.object({
  productionFamily: z.enum(["DECAPAGE", "REGLAGE", "CANA_TRANCHEE", "CANA_POSE"]),
  voie: z.string().min(1, "La voie est obligatoire."),
  tranche: z.string().optional(),
  troncon: z.string().optional(),
  workType: z.string().min(1, "Le type de travail est obligatoire."),
  equipmentId: z.string().optional(),
  driver: z.string().optional(),
  length: z.coerce.number().nonnegative("Longueur obligatoire."),
  width: z.coerce.number().nonnegative("Largeur obligatoire."),
  depth: z.coerce.number().optional(),
  hours: z.coerce.number().optional(),
  diameter: z.string().optional(),
  pipeType: z.string().optional(),
  soilType: z.string().optional(),
  poseType: z.string().optional(),
  allocatedGasoilLiters: z.coerce.number().optional(),
  allocatedGasoilAmount: z.coerce.number().optional(),
  allocatedEquipmentCost: z.coerce.number().optional(),
  allocatedWorkerCost: z.coerce.number().optional(),
  allocatedDriverExpenses: z.coerce.number().optional(),
  allocatedOtherCost: z.coerce.number().optional(),
});

export type ProductionFormValues = z.infer<typeof productionSchema>;
export type ProductionFormInput = z.input<typeof productionSchema>;
