import { treasuryApi, type CashAccount } from '@/lib/api-server';
import { CashAccountsPageClient } from './cash-accounts-page-client';

export const dynamic = 'force-dynamic';

export default async function CashAccountsPage() {
  let initialCashAccounts: CashAccount[] = [];
  try {
    initialCashAccounts = await treasuryApi.getCashAccounts();
  } catch (error) {
    console.error('Error fetching cash accounts:', error);
  }

  return <CashAccountsPageClient initialCashAccounts={initialCashAccounts} />;
}

