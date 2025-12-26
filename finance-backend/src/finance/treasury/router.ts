import { Elysia, t } from 'elysia'
import { TreasuryService } from './service.js'

export const treasuryRouter = new Elysia({ prefix: '/treasury' })
  .post(
    '/cash-accounts',
    async ({ body }) => await TreasuryService.createCashAccount(body),
    {
      body: t.Object({
        name: t.String(),
        type: t.Optional(t.Union([t.Literal('bank'), t.Literal('cash')])),
        currency: t.Optional(t.String()),
      }),
      detail: { tags: ['treasury'], summary: 'Crear cuenta de tesorería' },
    }
  )
  .get('/cash-accounts', async () => await TreasuryService.listCashAccounts(), {
    detail: { tags: ['treasury'], summary: 'Listar cuentas de tesorería' },
  })
  .post(
    '/transfers',
    async ({ body }) => await TreasuryService.createTransfer(body),
    {
      body: t.Object({
        cashAccountId: t.Optional(t.Number()),
        amount: t.Number(),
        reference: t.Optional(t.String()),
        notes: t.Optional(t.String()),
        occurredAt: t.Optional(t.String()),
      }),
      detail: { tags: ['treasury'], summary: 'Registrar transferencia (tesorería)' },
    }
  )
  .get(
    '/transfers',
    async ({ query }) => {
      const cashAccountId = (query as any)?.cashAccountId ? Number((query as any).cashAccountId) : undefined
      return await TreasuryService.listTransfers({ cashAccountId })
    },
    {
      query: t.Object({ cashAccountId: t.Optional(t.String()) }),
      detail: { tags: ['treasury'], summary: 'Listar transferencias' },
    }
  )
  .get('/balances', async () => await TreasuryService.balances(), {
    detail: { tags: ['treasury'], summary: 'Balances básicos por cuenta' },
  })


