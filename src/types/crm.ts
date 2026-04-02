export type CustomerStatus = "lead" | "aktiv" | "inaktiv";
export type OpportunityStage =
  | "neu"
  | "kontaktiert"
  | "angebot"
  | "verhandlung"
  | "gewonnen"
  | "verloren";
export type BillingStatus =
  | "entwurf"
  | "versendet"
  | "angenommen"
  | "faellig"
  | "bezahlt"
  | "ueberfaellig"
  | "storniert";
export type ProjectStatus = "geplant" | "aktiv" | "pausiert" | "abgeschlossen";
export type Priority = "niedrig" | "mittel" | "hoch" | "kritisch";
export type TaskStatus = "offen" | "in_arbeit" | "wartet" | "erledigt";
export type ActivityType = "anruf" | "email" | "meeting" | "notiz";
export type DocumentCategory =
  | "vertrag"
  | "angebot"
  | "rechnung"
  | "projekt"
  | "foto"
  | "sonstiges";

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  modified_by_label?: string | null;
}

export interface Customer extends BaseEntity {
  customer_number: string;
  company_name: string;
  contact_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  status: CustomerStatus;
  notes: string | null;
  tags: string[];
  duplicate_hash: string | null;
}

export interface Contact extends BaseEntity {
  customer_id: string;
  first_name: string;
  last_name: string;
  role_title: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  birth_date: string | null;
  notes: string | null;
  is_primary: boolean;
}

export interface Opportunity extends BaseEntity {
  customer_id: string;
  title: string;
  description: string | null;
  stage: OpportunityStage;
  probability: number;
  expected_value: number;
  actual_value: number;
  owner_name: string | null;
  expected_close_date: string | null;
  closed_at: string | null;
  tags: string[];
}

export interface Quote extends BaseEntity {
  customer_id: string;
  quote_number: string;
  title: string;
  status: BillingStatus;
  issue_date: string;
  valid_until: string | null;
  payment_terms: string | null;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  position_no: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_amount: number;
}

export interface Invoice extends BaseEntity {
  customer_id: string;
  invoice_number: string;
  source_quote_id: string | null;
  title: string;
  status: BillingStatus;
  issue_date: string;
  due_date: string | null;
  paid_at: string | null;
  payment_terms: string | null;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  position_no: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total_amount: number;
}

export interface Project extends BaseEntity {
  customer_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  start_date: string | null;
  end_date: string | null;
  owner_name: string | null;
  budget: number;
  progress: number;
  phase: string | null;
}

export interface Task extends BaseEntity {
  customer_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  due_date: string | null;
  owner_name: string | null;
  reminder_at: string | null;
  recurrence_rule: string | null;
  recurrence_interval: number | null;
  completed_at: string | null;
}

export interface CalendarEvent extends BaseEntity {
  customer_id: string | null;
  project_id: string | null;
  title: string;
  description: string | null;
  event_type: string;
  location: string | null;
  starts_at: string;
  ends_at: string;
  participants: string[];
  reminder_minutes: number | null;
  recurrence_rule: string | null;
}

export interface DocumentRecord extends BaseEntity {
  customer_id: string | null;
  project_id: string | null;
  title: string;
  file_name: string;
  mime_type: string | null;
  category: DocumentCategory;
  bucket_name: string;
  storage_path: string;
  file_size: number;
  version_no: number;
  checksum: string | null;
}

export interface Activity extends BaseEntity {
  customer_id: string | null;
  project_id: string | null;
  opportunity_id: string | null;
  task_id: string | null;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number | null;
}

export interface SettingRecord extends BaseEntity {
  setting_group: string;
  setting_key: string;
  setting_value: Record<string, unknown>;
  description: string | null;
}

export interface AuditLog {
  id: number;
  table_name: string;
  record_id: string;
  operation: string;
  actor_label: string;
  actor_id: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  changed_fields: string[];
  request_id: string | null;
  created_at: string;
}

export interface ReferenceOption {
  value: string;
  label: string;
}

export interface BootstrapPayload {
  customers: Customer[];
  contacts: Contact[];
  projects: Project[];
  opportunities: Opportunity[];
  settings: SettingRecord[];
  pipelineStages: ReferenceOption[];
  tags: ReferenceOption[];
}

export interface DashboardPayload {
  customerCount: number;
  leadCount: number;
  activeProjectCount: number;
  openRevenue: number;
  wonRevenue: number;
  winRate: number;
  overdueInvoices: number;
  overdueInvoiceAmount: number;
  taskDueToday: number;
  urgentTaskCount: number;
  activityCountWeek: number;
  documentCount: number;
  documentStorageMb: number;
  revenueByMonth: Array<{ month: string; amount: number }>;
  pipelineByStage: Array<{ stage: string; count: number; amount: number }>;
  taskByStatus: Array<{ status: string; count: number }>;
  recentActivities: Activity[];
  urgentTasks: Array<
    Pick<Task, "id" | "title" | "priority" | "status" | "due_date" | "owner_name">
  >;
  upcomingEvents: Array<
    Pick<CalendarEvent, "id" | "title" | "starts_at" | "ends_at" | "location" | "event_type">
  >;
  recentInvoices: Array<
    Pick<Invoice, "id" | "title" | "invoice_number" | "status" | "due_date" | "total_amount">
  >;
}

export type ResourceKey =
  | "customers"
  | "contacts"
  | "opportunities"
  | "quotes"
  | "invoices"
  | "projects"
  | "tasks"
  | "calendar_events"
  | "documents"
  | "activities"
  | "settings";

export type ResourceRecordMap = {
  customers: Customer;
  contacts: Contact;
  opportunities: Opportunity;
  quotes: Quote & { items?: QuoteItem[]; customer?: Pick<Customer, "id" | "company_name" | "customer_number"> };
  invoices: Invoice & {
    items?: InvoiceItem[];
    customer?: Pick<Customer, "id" | "company_name" | "customer_number">;
    source_quote?: Pick<Quote, "id" | "quote_number" | "title"> | null;
  };
  projects: Project;
  tasks: Task;
  calendar_events: CalendarEvent;
  documents: DocumentRecord;
  activities: Activity;
  settings: SettingRecord;
};
