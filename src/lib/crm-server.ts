import { addDays, addMonths, addWeeks, formatISO } from "date-fns";
import { createHash } from "node:crypto";

import { serverEnv } from "@/lib/env.server";
import { actorHeaderSchema, assertPayloadSize } from "@/lib/security";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resourceSchemas } from "@/lib/validators";
import type { ResourceKey } from "@/types/crm";

type ResourceConfig = {
  table: ResourceKey;
  orderBy: string;
};

type BillingMutationBody = Record<string, unknown> & {
  items?: Array<Record<string, unknown>>;
};

export const resourceConfigMap: Record<ResourceKey, ResourceConfig> = {
  customers: { table: "customers", orderBy: "updated_at" },
  contacts: { table: "contacts", orderBy: "updated_at" },
  opportunities: { table: "opportunities", orderBy: "updated_at" },
  quotes: { table: "quotes", orderBy: "issue_date" },
  invoices: { table: "invoices", orderBy: "issue_date" },
  projects: { table: "projects", orderBy: "updated_at" },
  tasks: { table: "tasks", orderBy: "updated_at" },
  calendar_events: { table: "calendar_events", orderBy: "starts_at" },
  documents: { table: "documents", orderBy: "updated_at" },
  activities: { table: "activities", orderBy: "starts_at" },
  settings: { table: "settings", orderBy: "updated_at" },
};

export function getActorLabel(request: Request) {
  return actorHeaderSchema.parse(
    request.headers.get("x-actor-label") ?? serverEnv.CRM_DEMO_ACTOR,
  );
}

export function assertResourceKey(value: string): ResourceKey {
  if (!(value in resourceConfigMap)) {
    throw new Error("Unbekannte Ressource.");
  }

  return value as ResourceKey;
}

function buildDuplicateHash(payload: Record<string, unknown>) {
  return createHash("sha256")
    .update(
      `${String(payload.company_name ?? "").toLowerCase()}|${String(payload.email ?? "").toLowerCase()}|${String(payload.phone ?? "").toLowerCase()}`,
    )
    .digest("hex");
}

function calculateTotals(items: Array<Record<string, unknown>>, defaultTaxRate: number) {
  const normalized = items.map((item, index) => {
    const quantity = Math.max(0.01, Number(item.quantity ?? 0));
    const unitPrice = Math.max(0, Number(item.unit_price ?? 0));
    const taxRate = Math.max(0, Number(item.tax_rate ?? defaultTaxRate));
    const totalAmount = Number((quantity * unitPrice).toFixed(2));

    return {
      position_no: index + 1,
      description: String(item.description ?? ""),
      quantity,
      unit_price: unitPrice,
      tax_rate: taxRate,
      total_amount: totalAmount,
    };
  });

  const subtotal = Number(
    normalized.reduce((sum, item) => sum + item.total_amount, 0).toFixed(2),
  );
  const taxAmount = Number(
    normalized
      .reduce((sum, item) => sum + item.total_amount * (item.tax_rate / 100), 0)
      .toFixed(2),
  );

  return {
    items: normalized,
    subtotal,
    taxAmount,
    totalAmount: Number((subtotal + taxAmount).toFixed(2)),
  };
}

async function hydrateBillingRecords(entity: "quotes" | "invoices") {
  const { data: records, error } = await supabaseAdmin
    .from(entity)
    .select("*")
    .is("deleted_at", null)
    .order(resourceConfigMap[entity].orderBy, { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const idList = (records ?? []).map((record) => record.id);
  const customerIds = [...new Set((records ?? []).map((record) => record.customer_id).filter(Boolean))];
  const sourceQuoteIds =
    entity === "invoices"
      ? [...new Set((records ?? []).map((record) => record.source_quote_id).filter(Boolean))]
      : [];

  const itemTable = entity === "quotes" ? "quote_items" : "invoice_items";
  const foreignKey = entity === "quotes" ? "quote_id" : "invoice_id";

  const [{ data: items, error: itemsError }, { data: customers, error: customersError }] =
    await Promise.all([
      supabaseAdmin
        .from(itemTable)
        .select("*")
        .in(foreignKey, idList.length ? idList : ["00000000-0000-0000-0000-000000000000"])
        .is("deleted_at", null),
      supabaseAdmin
        .from("customers")
        .select("id, company_name, customer_number")
        .in("id", customerIds.length ? customerIds : ["00000000-0000-0000-0000-000000000000"]),
    ]);

  const sourceQuotesResult =
    entity === "invoices"
      ? await supabaseAdmin
          .from("quotes")
          .select("id, quote_number, title")
          .in("id", sourceQuoteIds.length ? sourceQuoteIds : ["00000000-0000-0000-0000-000000000000"])
      : { data: [], error: null };

  if (itemsError || customersError || sourceQuotesResult.error) {
    throw new Error(
      itemsError?.message ??
        customersError?.message ??
        sourceQuotesResult.error?.message ??
        "Abhaengige Daten konnten nicht geladen werden.",
    );
  }

  const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer]));
  const sourceQuoteMap = new Map(
    (sourceQuotesResult.data ?? []).map((quote) => [quote.id, quote]),
  );
  const itemsByParent = new Map<string, Array<Record<string, unknown>>>();

  for (const item of items ?? []) {
    const parentId = String(item[foreignKey]);
    const current = itemsByParent.get(parentId) ?? [];
    current.push(item);
    itemsByParent.set(parentId, current);
  }

  return (records ?? []).map((record) => ({
    ...record,
    items: itemsByParent.get(record.id) ?? [],
    customer: customerMap.get(record.customer_id) ?? null,
    ...(entity === "invoices"
      ? { source_quote: record.source_quote_id ? sourceQuoteMap.get(record.source_quote_id) ?? null : null }
      : {}),
  }));
}

export async function listResource(resource: ResourceKey) {
  if (resource === "quotes" || resource === "invoices") {
    return hydrateBillingRecords(resource);
  }

  const { data, error } = await supabaseAdmin
    .from(resource)
    .select("*")
    .is("deleted_at", null)
    .order(resourceConfigMap[resource].orderBy, {
      ascending: resource === "calendar_events",
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function insertChildItems(
  entity: "quotes" | "invoices",
  parentId: string,
  items: Array<Record<string, unknown>>,
  actorLabel: string,
) {
  const itemTable = entity === "quotes" ? "quote_items" : "invoice_items";
  const foreignKey = entity === "quotes" ? "quote_id" : "invoice_id";
  const payload = items.map((item) => ({
    ...item,
    [foreignKey]: parentId,
    modified_by_label: actorLabel,
  }));

  if (payload.length === 0) {
    return;
  }

  const { error } = await supabaseAdmin.from(itemTable).insert(payload);
  if (error) {
    throw new Error(error.message);
  }
}

async function replaceChildItems(
  entity: "quotes" | "invoices",
  parentId: string,
  items: Array<Record<string, unknown>>,
  actorLabel: string,
) {
  const itemTable = entity === "quotes" ? "quote_items" : "invoice_items";
  const foreignKey = entity === "quotes" ? "quote_id" : "invoice_id";

  const { error: deleteError } = await supabaseAdmin
    .from(itemTable)
    .delete()
    .eq(foreignKey, parentId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  await insertChildItems(entity, parentId, items, actorLabel);
}

export async function createResource(
  resource: ResourceKey,
  rawBody: unknown,
  actorLabel: string,
) {
  assertPayloadSize(rawBody);

  const parsed = resourceSchemas[resource].parse(rawBody) as Record<string, unknown>;

  if (resource === "customers") {
    parsed.duplicate_hash = buildDuplicateHash(parsed);
  }

  if (resource === "quotes" || resource === "invoices") {
    const defaultTaxRate = Number(parsed.tax_rate ?? 19);
    const totals = calculateTotals(parsed.items as Array<Record<string, unknown>>, defaultTaxRate);
    const body: BillingMutationBody = {
      ...parsed,
      items: totals.items,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      total_amount: totals.totalAmount,
      modified_by_label: actorLabel,
    };

    delete body.items;

    const { data, error } = await supabaseAdmin
      .from(resource)
      .insert(body)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Datensatz konnte nicht gespeichert werden.");
    }

    await insertChildItems(resource, data.id, totals.items, actorLabel);

    const hydrated = await hydrateBillingRecords(resource);
    return hydrated.find((record) => record.id === data.id) ?? data;
  }

  const payload = {
    ...parsed,
    modified_by_label: actorLabel,
  };

  const { data, error } = await supabaseAdmin
    .from(resource)
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Datensatz konnte nicht gespeichert werden.");
  }

  return data;
}

function getNextRecurringDate(currentDate: string, recurrenceRule: string, interval: number) {
  const date = new Date(currentDate);

  if (recurrenceRule === "daily") {
    return formatISO(addDays(date, interval));
  }

  if (recurrenceRule === "weekly") {
    return formatISO(addWeeks(date, interval));
  }

  return formatISO(addMonths(date, interval));
}

async function maybeCreateRecurringTask(current: Record<string, unknown>, next: Record<string, unknown>) {
  if (
    current.status === "erledigt" ||
    next.status !== "erledigt" ||
    !next.recurrence_rule ||
    !next.due_date
  ) {
    return;
  }

  const nextDueDate = getNextRecurringDate(
    String(next.due_date),
    String(next.recurrence_rule),
    Number(next.recurrence_interval ?? 1),
  );

  const recurrencePayload = {
    customer_id: next.customer_id ?? null,
    project_id: next.project_id ?? null,
    title: next.title,
    description: next.description ?? null,
    priority: next.priority ?? "mittel",
    status: "offen",
    due_date: nextDueDate,
    owner_name: next.owner_name ?? null,
    reminder_at: next.reminder_at ?? null,
    recurrence_rule: next.recurrence_rule,
    recurrence_interval: next.recurrence_interval ?? 1,
    modified_by_label: next.modified_by_label,
  };

  const { error } = await supabaseAdmin.from("tasks").insert(recurrencePayload);
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateResource(
  resource: ResourceKey,
  id: string,
  rawBody: unknown,
  actorLabel: string,
) {
  assertPayloadSize(rawBody);

  const { data: currentRecord, error: currentError } = await supabaseAdmin
    .from(resource)
    .select("*")
    .eq("id", id)
    .single();

  if (currentError || !currentRecord) {
    throw new Error(currentError?.message ?? "Datensatz wurde nicht gefunden.");
  }

  const parsed = resourceSchemas[resource].partial().parse(rawBody) as Record<string, unknown>;

  if (resource === "customers") {
    parsed.duplicate_hash = buildDuplicateHash({
      ...currentRecord,
      ...parsed,
    });
  }

  if (resource === "quotes" || resource === "invoices") {
    const incomingBody = rawBody as Record<string, unknown> | null;
    const itemsSource = (parsed.items ?? incomingBody?.items ?? []) as Array<Record<string, unknown>>;
    const defaultTaxRate = Number(parsed.tax_rate ?? currentRecord.tax_rate ?? 19);
    const totals = calculateTotals(itemsSource, defaultTaxRate);
    const body: BillingMutationBody = {
      ...parsed,
      items: totals.items,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      total_amount: totals.totalAmount,
      modified_by_label: actorLabel,
    };
    delete body.items;

    const { data, error } = await supabaseAdmin
      .from(resource)
      .update(body)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Datensatz konnte nicht aktualisiert werden.");
    }

    await replaceChildItems(resource, id, totals.items, actorLabel);

    const hydrated = await hydrateBillingRecords(resource);
    return hydrated.find((record) => record.id === id) ?? data;
  }

  const payload = {
    ...parsed,
    modified_by_label: actorLabel,
  };

  const { data, error } = await supabaseAdmin
    .from(resource)
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Datensatz konnte nicht aktualisiert werden.");
  }

  if (resource === "tasks") {
    await maybeCreateRecurringTask(currentRecord, data);
  }

  return data;
}

export async function deleteResource(resource: ResourceKey, id: string, actorLabel: string) {
  const payload = {
    deleted_at: new Date().toISOString(),
    modified_by_label: actorLabel,
  };

  const { error } = await supabaseAdmin.from(resource).update(payload).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  if (resource === "quotes") {
    await supabaseAdmin
      .from("quote_items")
      .update(payload)
      .eq("quote_id", id);
  }

  if (resource === "invoices") {
    await supabaseAdmin
      .from("invoice_items")
      .update(payload)
      .eq("invoice_id", id);
  }

  return { success: true as const };
}
