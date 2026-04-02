export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="font-display text-5xl text-ink-900">Datenschutzerklaerung</h1>
      <div className="mt-6 space-y-4 text-sm text-ink-700">
        <p>Diese Vorlage dient als Ausgangspunkt fuer ein CRM-Demosystem nach DSGVO-Grundsaetzen.</p>
        <p>Verarbeitet werden nur Geschaeftskontaktdaten, Projekt-, Aufgaben-, Termin- und Dokumentenmetadaten.</p>
        <p>Betroffenenrechte werden ueber Export- und Soft-Delete-Funktionen unterstuetzt.</p>
        <p>Technische und organisatorische Massnahmen umfassen HTTPS-only, Security Headers, Audit-Trail und serverseitige Validierung.</p>
        <p>Die finale rechtliche Pruefung sollte durch eine qualifizierte Rechtsberatung erfolgen.</p>
      </div>
    </main>
  );
}

