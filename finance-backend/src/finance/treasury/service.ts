import { db } from '../../db.js'
import { cashAccounts, treasuryTransfers } from './schema.js'
import { desc, eq, sql } from 'drizzle-orm'
import { emitPermitAuditLog } from '../../audit/permit-client.js'

export interface CreateCashAccountInput {
  name: string
  type?: 'bank' | 'cash'
  currency?: string
}

export interface CreateTransferInput {
  cashAccountId?: number
  amount: number
  reference?: string
  notes?: string
  occurredAt?: string
}

export class TreasuryService {
  static async createCashAccount(data: CreateCashAccountInput) {
    const result = await db.insert(cashAccounts).values({
      name: data.name,
      type: (data.type || 'bank') as any,
      currency: data.currency || 'MXN',
    }).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'create',
      entityType: 'cash_accounts',
      entityId: result[0]!.id,
      changes: { after: result[0] },
      metadata: { source: 'finance-backend' },
    })

    return result[0]!
  }

  static async listCashAccounts() {
    return await db.select().from(cashAccounts).orderBy(desc(cashAccounts.id))
  }

  static async createTransfer(data: CreateTransferInput) {
    const result = await db.insert(treasuryTransfers).values({
      cashAccountId: data.cashAccountId ?? null,
      amount: data.amount.toString(),
      reference: data.reference,
      notes: data.notes,
      status: 'pending' as any,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
    }).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'create',
      entityType: 'treasury_transfers',
      entityId: result[0]!.id,
      changes: { after: result[0] },
      metadata: { source: 'finance-backend' },
    })

    return { ...result[0]!, amount: Number(result[0]!.amount) }
  }

  static async listTransfers(filters?: { cashAccountId?: number }) {
    const rows = filters?.cashAccountId
      ? await db.select().from(treasuryTransfers).where(eq(treasuryTransfers.cashAccountId, filters.cashAccountId)).orderBy(desc(treasuryTransfers.occurredAt))
      : await db.select().from(treasuryTransfers).orderBy(desc(treasuryTransfers.occurredAt))
    return rows.map((t) => ({ ...t, amount: Number(t.amount) }))
  }

  static async balances() {
    const rows = await db
      .select({
        cashAccountId: treasuryTransfers.cashAccountId,
        total: sql<string>`sum(${treasuryTransfers.amount})`,
      })
      .from(treasuryTransfers)
      .groupBy(treasuryTransfers.cashAccountId)

    return rows.map((r) => ({
      cashAccountId: r.cashAccountId,
      total: Number(r.total || 0),
    }))
  }
}


