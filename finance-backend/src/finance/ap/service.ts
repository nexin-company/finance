import { db } from '../../db.js'
import { apInvoices, apPaymentSchedules } from './schema.js'
import { desc, eq } from 'drizzle-orm'
import { emitPermitAuditLog } from '../../audit/permit-client.js'

export interface CreateApInvoiceInput {
  supplierId: number
  procurementReceiptId?: number
  invoiceNumber?: string
  currency?: string
  amount: number
  externalRef?: string
  dueDate?: string
  notes?: string
}

export interface CreatePaymentScheduleInput {
  invoiceId: number
  dueDate: string
  amount: number
}

export class ApService {
  static async createInvoice(data: CreateApInvoiceInput) {
    if (data.externalRef) {
      const existing = await db.select().from(apInvoices).where(eq(apInvoices.externalRef, data.externalRef))
      if (existing.length > 0) {
        return { ...existing[0]!, amount: Number(existing[0]!.amount) }
      }
    }

    const result = await db.insert(apInvoices).values({
      externalRef: data.externalRef,
      supplierId: data.supplierId,
      procurementReceiptId: data.procurementReceiptId,
      invoiceNumber: data.invoiceNumber,
      currency: data.currency || 'MXN',
      amount: data.amount.toString(),
      status: 'draft' as any,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes,
      updatedAt: new Date(),
    }).returning()

    await emitPermitAuditLog({
      userId: null,
      action: 'create',
      entityType: 'ap_invoices',
      entityId: result[0]!.id,
      changes: { after: result[0] },
      metadata: { source: 'finance-backend' },
    })

    return { ...result[0]!, amount: Number(result[0]!.amount) }
  }

  static async listInvoices(filters?: { supplierId?: number }) {
    const rows = filters?.supplierId
      ? await db.select().from(apInvoices).where(eq(apInvoices.supplierId, filters.supplierId)).orderBy(desc(apInvoices.updatedAt))
      : await db.select().from(apInvoices).orderBy(desc(apInvoices.updatedAt))

    return rows.map((i) => ({ ...i, amount: Number(i.amount) }))
  }

  static async createPaymentSchedule(data: CreatePaymentScheduleInput) {
    // Asegurar invoice existe
    const inv = await db.select().from(apInvoices).where(eq(apInvoices.id, data.invoiceId))
    if (inv.length === 0) throw new Error(`Invoice ${data.invoiceId} no encontrada`)

    const result = await db.insert(apPaymentSchedules).values({
      invoiceId: data.invoiceId,
      dueDate: new Date(data.dueDate),
      amount: data.amount.toString(),
      status: 'scheduled' as any,
    }).returning()

    // Marcar invoice como scheduled
    await db.update(apInvoices).set({ status: 'scheduled' as any, updatedAt: new Date() }).where(eq(apInvoices.id, data.invoiceId))

    await emitPermitAuditLog({
      userId: null,
      action: 'create',
      entityType: 'ap_payment_schedules',
      entityId: result[0]!.id,
      changes: { after: result[0] },
      metadata: { source: 'finance-backend' },
    })

    return { ...result[0]!, amount: Number(result[0]!.amount) }
  }

  static async listPaymentSchedules(filters?: { invoiceId?: number }) {
    const rows = filters?.invoiceId
      ? await db.select().from(apPaymentSchedules).where(eq(apPaymentSchedules.invoiceId, filters.invoiceId)).orderBy(desc(apPaymentSchedules.dueDate))
      : await db.select().from(apPaymentSchedules).orderBy(desc(apPaymentSchedules.dueDate))

    return rows.map((s) => ({ ...s, amount: Number(s.amount) }))
  }
}


