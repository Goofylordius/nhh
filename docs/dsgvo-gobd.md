# DSGVO- und GoBD-Hinweise

## Datenschutzerklaerung

Die Seite `src/app/datenschutz/page.tsx` enthaelt eine anpassbare Vorlage fuer die Web-Anwendung. Vor dem Produktiveinsatz sollten Verantwortlicher, Rechtsgrundlagen, Auftragsverarbeiter, Speicherdauern und Kontaktwege individuell ergaenzt werden.

## Loeschkonzept

- Fachliche Loeschung erfolgt als Soft-Delete ueber das Feld `deleted_at`.
- Datensaetze werden in Listen und Standardabfragen nur mit `deleted_at is null` angezeigt.
- Audit-Eintraege bleiben unveraendert erhalten und sichern die Nachvollziehbarkeit.
- Fuer physische Endgueltig-Loeschung sollte ein separater, dokumentierter Admin-Prozess ausserhalb der Demo-Phase vorgesehen werden.

## Audit-Trail-Abfragen

Aktueller Verlauf fuer einen Kunden:

```sql
select created_at, operation, actor_label, changed_fields
from audit_logs
where table_name = 'customers'
  and record_id = '20000000-0000-4000-8000-000000000001'
order by created_at desc;
```

Alle Aenderungen eines Bearbeiters:

```sql
select table_name, record_id, operation, created_at
from audit_logs
where actor_label = 'Demo-Arbeitsplatz'
order by created_at desc;
```

Unveraenderte Historie fuer Angebote und Rechnungen:

```sql
select table_name, record_id, operation, before_data, after_data, created_at
from audit_logs
where table_name in ('quotes', 'quote_items', 'invoices', 'invoice_items')
order by created_at desc;
```

## Betroffenenrechte / Datenexport

- JSON-Export fuer eine betroffene Person oder Firma: `GET /api/export/data-subject/:customerId`
- CSV-Export fuer Kundenstammdaten: `GET /api/export/customers/csv`
- iCal-Export fuer Termine: `GET /api/export/calendar/ical`

## Technische Schutzmassnahmen

- Security Headers in `next.config.ts`
- Request-IDs ueber `middleware.ts`
- Eingabevalidierung in `src/lib/validators.ts`
- Sanitization in `src/lib/security.ts`
- Audit-Trigger in `supabase/migrations/0001_crm_schema.sql`
