import { treasuryApi, type TreasuryTransfer } from '@/lib/api-server';
import { TransfersPageClient } from './transfers-page-client';

export const dynamic = 'force-dynamic';

export default async function TransfersPage() {
  let initialTransfers: TreasuryTransfer[] = [];
  try {
    initialTransfers = await treasuryApi.getTransfers();
  } catch (error) {
    console.error('Error fetching transfers:', error);
  }

  return <TransfersPageClient initialTransfers={initialTransfers} />;
}

