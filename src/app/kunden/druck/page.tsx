import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function CustomersPrintPage() {
  const { data: customers } = await supabaseAdmin
    .from("customers")
    .select("customer_number, company_name, contact_name, email, phone, city, status")
    .is("deleted_at", null)
    .order("company_name");

  return (
    <main className="mx-auto max-w-6xl p-6 print:p-0">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-[0.24em] text-ink-500">WerkstattCRM</p>
        <h1 className="mt-3 font-display text-5xl text-ink-900">Kundenliste</h1>
        <p className="mt-3 text-sm text-ink-700">
          Druckansicht für PDF-Export und interne Archivierung.
        </p>
      </header>
      <table className="min-w-full divide-y divide-ink-100 text-left text-sm">
        <thead className="bg-ink-50">
          <tr>
            <th className="px-3 py-3">Nr.</th>
            <th className="px-3 py-3">Kunde</th>
            <th className="px-3 py-3">Ansprechpartner</th>
            <th className="px-3 py-3">E-Mail</th>
            <th className="px-3 py-3">Telefon</th>
            <th className="px-3 py-3">Ort</th>
            <th className="px-3 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {(customers ?? []).map((customer) => (
            <tr key={customer.customer_number}>
              <td className="px-3 py-3">{customer.customer_number}</td>
              <td className="px-3 py-3">{customer.company_name}</td>
              <td className="px-3 py-3">{customer.contact_name}</td>
              <td className="px-3 py-3">{customer.email}</td>
              <td className="px-3 py-3">{customer.phone}</td>
              <td className="px-3 py-3">{customer.city}</td>
              <td className="px-3 py-3">{customer.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
