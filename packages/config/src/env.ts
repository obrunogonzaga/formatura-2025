import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  S3_ENDPOINT: z.string().url(),
  S3_PUBLIC_ENDPOINT: z.string().url().optional(),
  S3_PRESIGN_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().min(1),
  S3_REGION: z.string().min(1).default("us-east-1"),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: z
    .string()
    .optional()
    .transform((value) => value !== "false")
    .default("true"),
  NEXT_PUBLIC_MAX_FILE_SIZE_MB: z.coerce.number().default(10)
});

const clientSchema = z.object({
  NEXT_PUBLIC_MAX_FILE_SIZE_MB: z.coerce.number().default(10)
});

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;
let cachedClientEnv: z.infer<typeof clientSchema> | null = null;

export function getServerEnv() {
  if (!cachedServerEnv) {
    cachedServerEnv = serverSchema.parse(process.env);
  }
  return cachedServerEnv;
}

export function getClientEnv() {
  if (!cachedClientEnv) {
    cachedClientEnv = clientSchema.parse(process.env);
  }
  return cachedClientEnv;
}

