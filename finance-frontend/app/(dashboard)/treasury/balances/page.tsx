import { treasuryApi, type TreasuryBalance } from '@/lib/api-server';
import { BalancesPageClient } from './balances-page-client';

export const dynamic = 'force-dynamic';

export default async function BalancesPage() {
  let initialBalances: TreasuryBalance[] = [];
  try {
    initialBalances = await treasuryApi.getBalances();
  } catch (error) {
    console.error('Error fetching balances:', error);
  }

  return <BalancesPageClient initialBalances={initialBalances} />;
}

