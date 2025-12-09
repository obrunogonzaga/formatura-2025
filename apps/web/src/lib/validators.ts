import { z } from "zod";

export const photoInputSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().optional(),
  photoIndex: z.number().int().nonnegative().optional()
});

export const childInputSchema = z.object({
  name: z.string().min(2, "Informe o nome da criança"),
  childIndex: z.number().int().nonnegative().optional(),
  photos: z.array(photoInputSchema).length(3, "São necessárias 3 fotos por criança")
});

export const submissionInputSchema = z.object({
  guardianName: z.string().min(2, "Informe o nome do responsável"),
  turma: z.enum(["JII A", "JII B"], {
    required_error: "Selecione a turma"
  }),
  children: z.array(childInputSchema).min(1, "Inclua ao menos uma criança")
});

export type SubmissionInput = z.infer<typeof submissionInputSchema>;

