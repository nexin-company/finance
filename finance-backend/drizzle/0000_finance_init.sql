-- Finance Backend initial migration

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cash_account_type') THEN
    CREATE TYPE "cash_account_type" AS ENUM ('bank','cash');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'treasury_transfer_status') THEN
    CREATE TYPE "treasury_transfer_status" AS ENUM ('pending','posted','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ar_payment_method') THEN
    CREATE TYPE "ar_payment_method" AS ENUM ('bank_transfer');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ar_payment_status') THEN
    CREATE TYPE "ar_payment_status" AS ENUM ('pending','confirmed','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ap_invoice_status') THEN
    CREATE TYPE "ap_invoice_status" AS ENUM ('draft','approved','scheduled','paid','cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ap_payment_schedule_status') THEN
    CREATE TYPE "ap_payment_schedule_status" AS ENUM ('scheduled','paid','cancelled');
  END IF;
END $$;

-- API keys
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" serial PRIMARY KEY NOT NULL,
  "key_hash" text NOT NULL,
  "name" text NOT NULL,
  "scopes" jsonb,
  "rate_limit" integer DEFAULT 100,
  "expires_at" timestamp,
  "created_by" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp,
  "is_active" text DEFAULT 'active',
  CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);

-- Treasury
CREATE TABLE IF NOT EXISTS "cash_accounts" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "type" "cash_account_type" DEFAULT 'bank' NOT NULL,
  "currency" text DEFAULT 'MXN' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "treasury_transfers" (
  "id" serial PRIMARY KEY NOT NULL,
  "cash_account_id" integer,
  "amount" numeric(12, 2) NOT NULL,
  "reference" text,
  "notes" text,
  "status" "treasury_transfer_status" DEFAULT 'pending' NOT NULL,
  "occurred_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'treasury_transfers_cash_account_id_cash_accounts_id_fk'
  ) THEN
    ALTER TABLE "treasury_transfers"
      ADD CONSTRAINT "treasury_transfers_cash_account_id_cash_accounts_id_fk"
      FOREIGN KEY ("cash_account_id") REFERENCES "cash_accounts"("id")
      ON DELETE set null;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_treasury_transfers_cash_account_id" ON "treasury_transfers" ("cash_account_id");

-- AR
CREATE TABLE IF NOT EXISTS "ar_payments" (
  "id" serial PRIMARY KEY NOT NULL,
  "customer_id" integer NOT NULL,
  "order_id" integer,
  "amount" numeric(12, 2) NOT NULL,
  "currency" text DEFAULT 'MXN' NOT NULL,
  "method" "ar_payment_method" DEFAULT 'bank_transfer' NOT NULL,
  "status" "ar_payment_status" DEFAULT 'confirmed' NOT NULL,
  "reference" text,
  "proof_url" text,
  "notes" text,
  "paid_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_ar_payments_customer_id" ON "ar_payments" ("customer_id");
CREATE INDEX IF NOT EXISTS "idx_ar_payments_order_id" ON "ar_payments" ("order_id");

-- AP
CREATE TABLE IF NOT EXISTS "ap_invoices" (
  "id" serial PRIMARY KEY NOT NULL,
  "supplier_id" integer NOT NULL,
  "procurement_receipt_id" integer,
  "invoice_number" text,
  "currency" text DEFAULT 'MXN' NOT NULL,
  "amount" numeric(12, 2) NOT NULL,
  "status" "ap_invoice_status" DEFAULT 'draft' NOT NULL,
  "due_date" timestamp,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_ap_invoices_supplier_id" ON "ap_invoices" ("supplier_id");
CREATE INDEX IF NOT EXISTS "idx_ap_invoices_status" ON "ap_invoices" ("status");

CREATE TABLE IF NOT EXISTS "ap_payment_schedules" (
  "id" serial PRIMARY KEY NOT NULL,
  "invoice_id" integer NOT NULL,
  "due_date" timestamp NOT NULL,
  "amount" numeric(12, 2) NOT NULL,
  "status" "ap_payment_schedule_status" DEFAULT 'scheduled' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ap_payment_schedules_invoice_id_ap_invoices_id_fk'
  ) THEN
    ALTER TABLE "ap_payment_schedules"
      ADD CONSTRAINT "ap_payment_schedules_invoice_id_ap_invoices_id_fk"
      FOREIGN KEY ("invoice_id") REFERENCES "ap_invoices"("id")
      ON DELETE cascade;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_ap_payment_schedules_invoice_id" ON "ap_payment_schedules" ("invoice_id");


