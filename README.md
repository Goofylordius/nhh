# WerkstattCRM

Produktionsnahe CRM-Demo fuer Handwerksbetriebe und kleine Geschaefte auf Basis von Next.js, Supabase und Vercel.

## Start

```bash
npm install
npm run dev
```

## Umgebungsvariablen

Siehe `.env.example`.

## Supabase

1. SQL aus `supabase/migrations/0001_crm_schema.sql` ausfuehren.
2. Optional `supabase/seed.sql` fuer Testdaten laden.
3. Storage-Bucket `crm-documents` anlegen oder das SQL aus der Migration verwenden.

