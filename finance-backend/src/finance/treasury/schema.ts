import { pgTable, serial, text, timestamp, numeric, pgEnum, integer } from "drizzle-orm/pg-core";

export const cashAccountTypeEnum = pgEnum('cash_account_type', ['bank', 'cash']);

export const cashAccounts = pgTable("cash_accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: cashAccountTypeEnum("type").notNull().default("bank"),
  currency: text("currency").notNull().default("MXN"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const treasuryTransferStatusEnum = pgEnum('treasury_transfer_status', ['pending', 'posted', 'cancelled']);

export const treasuryTransfers = pgTable("treasury_transfers", {
  id: serial("id").primaryKey(),
  cashAccountId: integer("cash_account_id").references(() => cashAccounts.id, { onDelete: 'set null' }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  reference: text("reference"),
  notes: text("notes"),
  status: treasuryTransferStatusEnum("status").notNull().default("pending"),
  occurredAt: timestamp("occurred_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


