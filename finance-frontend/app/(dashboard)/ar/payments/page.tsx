import { arApi, type ArPayment } from '@/lib/api-server';
import { ArPaymentsPageClient } from './payments-page-client';

export const dynamic = 'force-dynamic';

export default async function ArPaymentsPage() {
  let initialPayments: ArPayment[] = [];
  try {
    initialPayments = await arApi.getPayments();
  } catch (error) {
    console.error('Error fetching AR payments:', error);
  }

  return <ArPaymentsPageClient initialPayments={initialPayments} />;
}

