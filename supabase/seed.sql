insert into settings (id, setting_group, setting_key, setting_value, description, modified_by_label)
values
  ('10000000-0000-4000-8000-000000000001', 'firma', 'stammdaten', '{"name":"Musterbetrieb Berlin GmbH","ust_id":"DE999999999","telefon":"+49 30 1234567","email":"info@musterbetrieb.de","adresse":"Musterstrasse 7, 10115 Berlin"}', 'Firmendaten fuer Demo', 'System-Seed'),
  ('10000000-0000-4000-8000-000000000002', 'steuern', 'standard_mwst', '{"value":19}', 'Standard-MwSt fuer Deutschland', 'System-Seed'),
  ('10000000-0000-4000-8000-000000000003', 'pipeline', 'stages', '{"values":["neu","kontaktiert","angebot","verhandlung","gewonnen","verloren"]}', 'Standard-Pipeline', 'System-Seed'),
  ('10000000-0000-4000-8000-000000000004', 'tags', 'kunden', '{"values":["Sanitaer","Notdienst","Wartung","Stammkunde","Neubau"]}', 'Tag-Vorschlaege', 'System-Seed')
on conflict do nothing;

insert into customers (
  id, customer_number, company_name, contact_name, address_line1, postal_code, city, country,
  email, phone, website, industry, status, notes, tags, duplicate_hash, modified_by_label
)
values
  ('20000000-0000-4000-8000-000000000001', 'KND-2026-00001', 'Baeckerei Morgenrot', 'Julia Kramer', 'Marktplatz 2', '04109', 'Leipzig', 'Deutschland', 'office@morgenrot.de', '+49 341 998877', 'https://morgenrot.example', 'Einzelhandel', 'aktiv', 'Regelmaessige Wartung der Kuehltechnik.', '{"Stammkunde","Wartung"}', md5('Baeckerei Morgenrotoffice@morgenrot.de+49 341 998877'), 'System-Seed'),
  ('20000000-0000-4000-8000-000000000002', 'KND-2026-00002', 'Kfz-Service Nord', 'Ali Oezdemir', 'Werkhof 18', '22335', 'Hamburg', 'Deutschland', 'werkstatt@kfz-nord.de', '+49 40 223344', 'https://kfz-nord.example', 'Handwerk', 'lead', 'Anfrage fuer neue Hallenbeleuchtung.', '{"Neubau"}', md5('Kfz-Service Nordwerkstatt@kfz-nord.de+49 40 223344'), 'System-Seed'),
  ('20000000-0000-4000-8000-000000000003', 'KND-2026-00003', 'Apotheke am Rathaus', 'Dr. Petra Lehmann', 'Rathausplatz 5', '90402', 'Nuernberg', 'Deutschland', 'kontakt@apotheke-rathaus.de', '+49 911 556677', null, 'Gesundheit', 'aktiv', 'Braucht regelmaessige Dokumentation fuer Kassenbereich.', '{"Stammkunde"}', md5('Apotheke am Rathauskontakt@apotheke-rathaus.de+49 911 556677'), 'System-Seed')
on conflict do nothing;

insert into contacts (
  id, customer_id, first_name, last_name, role_title, email, phone, mobile, birth_date, notes, is_primary, modified_by_label
)
values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Julia', 'Kramer', 'Inhaberin', 'j.kramer@morgenrot.de', '+49 341 998877', '+49 171 111111', '1988-03-14', 'Bevorzugt WhatsApp fuer Kurzabstimmungen.', true, 'System-Seed'),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Ali', 'Oezdemir', 'Geschaeftsfuehrer', 'ali@kfz-nord.de', '+49 40 223344', '+49 172 222222', '1984-08-02', 'Entscheider fuer Umbauprojekt.', true, 'System-Seed'),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003', 'Petra', 'Lehmann', 'Apothekerin', 'petra.lehmann@apotheke-rathaus.de', '+49 911 556677', null, '1979-12-21', 'Legt Wert auf PDF-Protokolle.', true, 'System-Seed')
on conflict do nothing;

insert into opportunities (
  id, customer_id, title, description, stage, probability, expected_value, actual_value, owner_name, expected_close_date, tags, modified_by_label
)
values
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'LED-Hallenbeleuchtung', 'Austausch der Bestandsbeleuchtung inkl. Steuerung.', 'angebot', 60, 18500.00, 0, 'S. Huber', '2026-04-24', '{"Neubau"}', 'System-Seed'),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', 'Wartungsvertrag 2026', 'Jaehrlicher Service fuer Backstuben-Kaelte.', 'gewonnen', 100, 4200.00, 4200.00, 'M. Engel', '2026-02-02', '{"Wartung","Stammkunde"}', 'System-Seed')
on conflict do nothing;

insert into quotes (
  id, customer_id, quote_number, title, status, issue_date, valid_until, payment_terms, currency, subtotal, tax_rate, tax_amount, total_amount, notes, modified_by_label
)
values
  ('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'ANG-2026-00001', 'Angebot Hallenbeleuchtung', 'versendet', '2026-04-01', '2026-04-30', '14 Tage netto', 'EUR', 15546.22, 19, 2953.78, 18500.00, 'Montage ausserhalb der Oeffnungszeiten eingeplant.', 'System-Seed')
on conflict do nothing;

insert into quote_items (
  id, quote_id, position_no, description, quantity, unit_price, tax_rate, total_amount, modified_by_label
)
values
  ('51000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', 1, 'LED-Industriestrahler inkl. Netzteil', 18, 620.00, 19, 11160.00, 'System-Seed'),
  ('51000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', 2, 'Steuerung und Sensorik', 1, 2486.22, 19, 2486.22, 'System-Seed'),
  ('51000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000001', 3, 'Montage und Entsorgung', 1, 1900.00, 19, 1900.00, 'System-Seed')
on conflict do nothing;

insert into invoices (
  id, customer_id, source_quote_id, invoice_number, title, status, issue_date, due_date, payment_terms, currency, subtotal, tax_rate, tax_amount, total_amount, notes, modified_by_label
)
values
  ('60000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', null, 'RE-2026-00001', 'Wartung Kuehlanlage Februar 2026', 'bezahlt', '2026-02-05', '2026-02-19', '14 Tage netto', 'EUR', 3529.41, 19, 670.59, 4200.00, 'Bereits per Ueberweisung beglichen.', 'System-Seed')
on conflict do nothing;

insert into invoice_items (
  id, invoice_id, position_no, description, quantity, unit_price, tax_rate, total_amount, modified_by_label
)
values
  ('61000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001', 1, 'Regelwartung Kaelteanlage', 1, 2100.00, 19, 2100.00, 'System-Seed'),
  ('61000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000001', 2, 'Austausch Filtermodule', 1, 1429.41, 19, 1429.41, 'System-Seed')
on conflict do nothing;

insert into projects (
  id, customer_id, title, description, status, priority, start_date, end_date, owner_name, budget, progress, phase, modified_by_label
)
values
  ('70000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'Umbau Hallenlicht', 'Projekt fuer neue energieeffiziente Werkstattbeleuchtung.', 'aktiv', 'hoch', '2026-04-07', '2026-04-29', 'S. Huber', 18500.00, 35, 'Montageplanung', 'System-Seed'),
  ('70000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003', 'Dokumentation Kassenbereich', 'Erstellung revisionssicherer Projektunterlagen.', 'geplant', 'mittel', '2026-04-12', '2026-05-04', 'L. Franke', 3200.00, 10, 'Kickoff', 'System-Seed')
on conflict do nothing;

insert into tasks (
  id, customer_id, project_id, title, description, priority, status, due_date, owner_name, reminder_at, recurrence_rule, recurrence_interval, modified_by_label
)
values
  ('80000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000001', 'Montageplan freigeben', 'Kundenfreigabe fuer Lampenraster einholen.', 'hoch', 'in_arbeit', '2026-04-04 14:00:00+00', 'S. Huber', '2026-04-04 09:00:00+00', null, null, 'System-Seed'),
  ('80000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', null, 'Monatliche Wartung vorbereiten', 'Checkliste fuer wiederkehrenden Einsatz.', 'mittel', 'offen', '2026-04-15 08:00:00+00', 'M. Engel', '2026-04-14 14:00:00+00', 'monthly', 1, 'System-Seed')
on conflict do nothing;

insert into calendar_events (
  id, customer_id, project_id, title, description, event_type, location, starts_at, ends_at, participants, reminder_minutes, recurrence_rule, modified_by_label
)
values
  ('90000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000001', 'Baustellenbesprechung', 'Abstimmung mit Werkstattleitung vor Montage.', 'Meeting', 'Hamburg, Werkhof 18', '2026-04-08 07:30:00+00', '2026-04-08 08:30:00+00', '{"S. Huber","Ali Oezdemir"}', 60, null, 'System-Seed'),
  ('90000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', null, 'Servicefenster Backstube', 'Regelmaessiges Wartungsfenster ausserhalb des Verkaufs.', 'Einsatz', 'Leipzig, Marktplatz 2', '2026-04-16 04:30:00+00', '2026-04-16 06:30:00+00', '{"M. Engel","Julia Kramer"}', 180, 'monthly', 'System-Seed')
on conflict do nothing;

insert into documents (
  id, customer_id, project_id, title, file_name, mime_type, category, bucket_name, storage_path, file_size, version_no, checksum, modified_by_label
)
values
  ('a0000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000001', 'Angebot LED-Halle', 'angebot-led-halle.pdf', 'application/pdf', 'angebot', 'crm-documents', 'customers/20000000-0000-4000-8000-000000000002/angebote/angebot-led-halle.pdf', 248122, 1, md5('angebot-led-halle'), 'System-Seed')
on conflict do nothing;

insert into activities (
  id, customer_id, project_id, opportunity_id, task_id, activity_type, title, description, starts_at, duration_minutes, modified_by_label
)
values
  ('b0000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000001', 'meeting', 'Projektauftakt mit Kunde', 'Bauabschnitte und Sperrzeiten abgestimmt.', '2026-04-02 08:15:00+00', 45, 'System-Seed'),
  ('b0000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', null, '40000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000002', 'anruf', 'Wartungsfenster bestaetigt', 'Telefonische Bestaetigung fuer April-Einsatz.', '2026-04-01 10:00:00+00', 10, 'System-Seed')
on conflict do nothing;
