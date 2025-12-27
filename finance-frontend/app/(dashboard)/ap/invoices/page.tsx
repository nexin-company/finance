import { apApi, type ApInvoice } from '@/lib/api-server';
import { ApInvoicesPageClient } from './invoices-page-client';

export const dynamic = 'force-dynamic';

export default async function ApInvoicesPage({
  searchParams
}: {
  searchParams: Promise<{ supplierId?: string; procurementReceiptId?: string }>;
}) {
  const params = await searchParams;
  let initialInvoices: ApInvoice[] = [];
  try {
    const filters = params.supplierId ? { supplierId: Number(params.supplierId) } : undefined;
    initialInvoices = await apApi.getInvoices(filters);
  } catch (error) {
    console.error('Error fetching AP invoices:', error);
  }

  return <ApInvoicesPageClient initialInvoices={initialInvoices} prefillSupplierId={params.supplierId ? Number(params.supplierId) : undefined} prefillReceiptId={params.procurementReceiptId ? Number(params.procurementReceiptId) : undefined} />;
}

