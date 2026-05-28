import { z } from "zod";

export const gasoilSortieSchema = z.object({
  equipmentId: z.string().min(1, "Choisir un engin est obligatoire."),
  liters: z.coerce.number().positive("Les litres doivent etre superieurs a 0."),
  allocation: z.enum(["production", "etp", "personnel", "transport", "autre"]),
  responsible: z.string().min(2, "Le chauffeur ou responsable est obligatoire."),
  observation: z.string().optional(),
});

export type GasoilSortieFormValues = z.infer<typeof gasoilSortieSchema>;
export type GasoilSortieFormInput = z.input<typeof gasoilSortieSchema>;
