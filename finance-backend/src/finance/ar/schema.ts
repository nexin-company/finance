import { pgTable, serial, integer, text, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";

export const arPaymentMethodEnum = pgEnum('ar_payment_method', ['bank_transfer']);
export const arPaymentStatusEnum = pgEnum('ar_payment_status', ['pending', 'confirmed', 'cancelled']);

/**
 * Pagos AR (cobranza). Referencia a Vendor:
 * - customerId: vendor.customers.id
 * - orderId: vendor.orders.id
 */
export const arPayments = pgTable("ar_payments", {
  id: serial("id").primaryKey(),
  // Idempotencia cross-service (ej: "vendor:payment_records:123")
  externalRef: text("external_ref").unique(),
  customerId: integer("customer_id").notNull(),
  orderId: integer("order_id"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("MXN"),
  method: arPaymentMethodEnum("method").notNull().default("bank_transfer"),
  status: arPaymentStatusEnum("status").notNull().default("confirmed"),
  reference: text("reference"),
  proofUrl: text("proof_url"),
  notes: text("notes"),
  paidAt: timestamp("paid_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


