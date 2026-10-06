import { z } from "zod";

const envSchema = z.object({
  VITE_DEV_API_URL: z.string(),
});
const parsedEnv = envSchema.parse(import.meta.env);

const devApiUrl = parsedEnv.VITE_DEV_API_URL;

export const env = {
  VITE_DEV_API_URL: devApiUrl,
} as const;
