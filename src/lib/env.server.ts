import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("WerkstattCRM"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  SUPABASE_STORAGE_BUCKET: z.string().default("crm-documents"),
  CRM_DEMO_ACTOR: z.string().default("Demo-Arbeitsplatz"),
});

export const serverEnv = serverEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
  CRM_DEMO_ACTOR: process.env.CRM_DEMO_ACTOR,
});

