import { arApi, type ArAgingEntry } from '@/lib/api-server';
import { AgingPageClient } from './aging-page-client';

export const dynamic = 'force-dynamic';

export default async function AgingPage() {
  let initialAging: ArAgingEntry[] = [];
  try {
    initialAging = await arApi.getAging();
  } catch (error) {
    console.error('Error fetching aging:', error);
  }

  return <AgingPageClient initialAging={initialAging} />;
}

