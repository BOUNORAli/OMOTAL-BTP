import { z } from "zod";

export const productionSchema = z.object({
  voie: z.string().min(1, "La voie est obligatoire."),
  tranche: z.string().optional(),
  troncon: z.string().optional(),
  workType: z.string().min(1, "Le type de travail est obligatoire."),
  equipmentId: z.string().optional(),
  driver: z.string().optional(),
  length: z.coerce.number().positive("Longueur obligatoire."),
  width: z.coerce.number().positive("Largeur obligatoire."),
  depth: z.coerce.number().optional(),
  hours: z.coerce.number().optional(),
});

export type ProductionFormValues = z.infer<typeof productionSchema>;
export type ProductionFormInput = z.input<typeof productionSchema>;
