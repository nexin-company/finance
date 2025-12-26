import { Elysia, t } from 'elysia'
import { ArService } from './service.js'

export const arRouter = new Elysia({ prefix: '/ar' })
  .post(
    '/payments',
    async ({ body }) => await ArService.createPayment(body),
    {
      body: t.Object({
        customerId: t.Number(),
        orderId: t.Optional(t.Number()),
        amount: t.Number(),
        currency: t.Optional(t.String()),
        method: t.Optional(t.Union([t.Literal('bank_transfer')])),
        externalRef: t.Optional(t.String()),
        reference: t.Optional(t.String()),
        proofUrl: t.Optional(t.String()),
        notes: t.Optional(t.String()),
        paidAt: t.Optional(t.String()),
      }),
      detail: { tags: ['ar'], summary: 'Registrar pago (AR)' },
    }
  )
  .get(
    '/payments',
    async ({ query }) => {
      const customerId = (query as any)?.customerId ? Number((query as any).customerId) : undefined
      const orderId = (query as any)?.orderId ? Number((query as any).orderId) : undefined
      return await ArService.listPayments({ customerId, orderId })
    },
    {
      query: t.Object({
        customerId: t.Optional(t.String()),
        orderId: t.Optional(t.String()),
      }),
      detail: { tags: ['ar'], summary: 'Listar pagos (AR)' },
    }
  )
  .get('/aging', async () => await ArService.aging(), {
    detail: { tags: ['ar'], summary: 'Aging (simplificado)' },
  })


