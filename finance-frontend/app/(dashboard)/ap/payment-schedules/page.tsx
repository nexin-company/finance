import { apApi, type ApPaymentSchedule } from '@/lib/api-server';
import { PaymentSchedulesPageClient } from './payment-schedules-page-client';

export const dynamic = 'force-dynamic';

export default async function PaymentSchedulesPage() {
  let initialSchedules: ApPaymentSchedule[] = [];
  try {
    initialSchedules = await apApi.getPaymentSchedules();
  } catch (error) {
    console.error('Error fetching payment schedules:', error);
  }

  return <PaymentSchedulesPageClient initialSchedules={initialSchedules} />;
}

