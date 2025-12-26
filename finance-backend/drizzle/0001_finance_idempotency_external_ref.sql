-- Finance migration 0001: idempotency via external_ref

ALTER TABLE "ar_payments"
  ADD COLUMN IF NOT EXISTS "external_ref" text;

CREATE UNIQUE INDEX IF NOT EXISTS "uniq_ar_payments_external_ref"
  ON "ar_payments" ("external_ref");

ALTER TABLE "ap_invoices"
  ADD COLUMN IF NOT EXISTS "external_ref" text;

CREATE UNIQUE INDEX IF NOT EXISTS "uniq_ap_invoices_external_ref"
  ON "ap_invoices" ("external_ref");


