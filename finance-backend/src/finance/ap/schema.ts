import { pgTable, serial, integer, text, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";

export const apInvoiceStatusEnum = pgEnum('ap_invoice_status', ['draft', 'approved', 'scheduled', 'paid', 'cancelled']);

/**
 * AP invoices (facturas proveedor).
 * supplierId referencia a Procurement.suppliers.id (sin FK).
 */
export const apInvoices = pgTable("ap_invoices", {
  id: serial("id").primaryKey(),
  // Idempotencia cross-service (ej: "procurement:receipts:123")
  externalRef: text("external_ref").unique(),
  supplierId: integer("supplier_id").notNull(),
  procurementReceiptId: integer("procurement_receipt_id"),
  invoiceNumber: text("invoice_number"),
  currency: text("currency").notNull().default("MXN"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: apInvoiceStatusEnum("status").notNull().default("draft"),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const apPaymentScheduleStatusEnum = pgEnum('ap_payment_schedule_status', ['scheduled', 'paid', 'cancelled']);

export const apPaymentSchedules = pgTable("ap_payment_schedules", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => apInvoices.id, { onDelete: 'cascade' }),
  dueDate: timestamp("due_date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: apPaymentScheduleStatusEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


