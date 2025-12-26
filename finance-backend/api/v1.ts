import { Elysia } from 'elysia'
import { apiKeysRouter } from '../src/api-keys/router.js'
import { arRouter } from '../src/finance/ar/router.js'
import { treasuryRouter } from '../src/finance/treasury/router.js'
import { apRouter } from '../src/finance/ap/router.js'

/**
 * API v1 - Finance (treasury + AR/AP)
 */
export const v1Routes = new Elysia({ prefix: '/v1' })
  .use(apiKeysRouter)
  .use(treasuryRouter)
  .use(arRouter)
  .use(apRouter)


