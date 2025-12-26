import { db } from '../../db.js'
import { arPayments } from './schema.js'
import { and, desc, eq, sql } from 'drizzle-orm'
import { emitPermitAuditLog } from '../../audit/permit-client.js'

export interface CreateArPaymentInput {
  customerId: number
  orderId?: number
  amount: number
  currency?: string
  method?: 'bank_transfer'
  externalRef?: string
  reference?: string
  proofUrl?: string
  notes?: string
  paidAt?: string
}

export class ArService {
  static async createPayment(data: CreateArPaymentInput) {
    if (data.externalRef) {
      const existing = await db.select().from(arPayments).where(eq(arPayments.externalRef, data.externalRef))
      if (existing.length > 0) {
        return { ...existing[0]!, amount: Number(existing[0]!.amount) }
      }
    }

    const result = await db.insert(arPayments).values({
      externalRef: data.externalRef,
      customerId: data.customerId,
      orderId: data.orderId,
      amount: data.amount.toString(),
      currency: data.currency || 'MXN',
      method: data.method || 'bank_transfer',
      status: 'confirmed' as any,
      reference: data.reference,
      proofUrl: data.proofUrl,
      notes: data.notes,
      paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
    }).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'payment_recorded',
      entityType: 'ar_payments',
      entityId: result[0]!.id,
      changes: { after: result[0] },
      metadata: { source: 'finance-backend' },
    })

    return { ...result[0]!, amount: Number(result[0]!.amount) }
  }

  static async listPayments(filters?: { customerId?: number; orderId?: number }) {
    const conditions: any[] = []
    if (filters?.customerId) conditions.push(eq(arPayments.customerId, filters.customerId))
    if (filters?.orderId) conditions.push(eq(arPayments.orderId, filters.orderId))

    const rows = await db.select().from(arPayments).where(conditions.length ? and(...conditions) : undefined as any).orderBy(desc(arPayments.paidAt))
    return rows.map((p) => ({ ...p, amount: Number(p.amount) }))
  }

  static async aging() {
    // MVP: “aging” simplificado = total pagado por cliente
    const rows = await db
      .select({
        customerId: arPayments.customerId,
        totalPaid: sql<string>`sum(${arPayments.amount})`,
        paymentsCount: sql<string>`count(*)`,
        lastPaymentAt: sql<string>`max(${arPayments.paidAt})`,
      })
      .from(arPayments)
      .groupBy(arPayments.customerId)

    return rows.map((r) => ({
      customerId: r.customerId,
      totalPaid: Number(r.totalPaid || 0),
      paymentsCount: Number(r.paymentsCount || 0),
      lastPaymentAt: r.lastPaymentAt,
    }))
  }
}


