import { Elysia, t } from 'elysia'
import { ApService } from './service.js'

export const apRouter = new Elysia({ prefix: '/ap' })
  .post(
    '/invoices',
    async ({ body }) => await ApService.createInvoice(body),
    {
      body: t.Object({
        supplierId: t.Number(),
        procurementReceiptId: t.Optional(t.Number()),
        invoiceNumber: t.Optional(t.String()),
        currency: t.Optional(t.String()),
        amount: t.Number(),
        externalRef: t.Optional(t.String()),
        dueDate: t.Optional(t.String()),
        notes: t.Optional(t.String()),
      }),
      detail: { tags: ['ap'], summary: 'Crear invoice (AP)' },
    }
  )
  .get(
    '/invoices',
    async ({ query }) => {
      const supplierId = (query as any)?.supplierId ? Number((query as any).supplierId) : undefined
      return await ApService.listInvoices({ supplierId })
    },
    {
      query: t.Object({ supplierId: t.Optional(t.String()) }),
      detail: { tags: ['ap'], summary: 'Listar invoices (AP)' },
    }
  )
  .post(
    '/payment-schedules',
    async ({ body }) => await ApService.createPaymentSchedule(body),
    {
      body: t.Object({
        invoiceId: t.Number(),
        dueDate: t.String(),
        amount: t.Number(),
      }),
      detail: { tags: ['ap'], summary: 'Crear payment schedule (AP)' },
    }
  )
  .get(
    '/payment-schedules',
    async ({ query }) => {
      const invoiceId = (query as any)?.invoiceId ? Number((query as any).invoiceId) : undefined
      return await ApService.listPaymentSchedules({ invoiceId })
    },
    {
      query: t.Object({ invoiceId: t.Optional(t.String()) }),
      detail: { tags: ['ap'], summary: 'Listar payment schedules (AP)' },
    }
  )


