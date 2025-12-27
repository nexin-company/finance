/**
 * Cliente API server-side para comunicarse con finance-backend
 * La API key se mantiene solo en el servidor
 */

import 'server-only';
import { auth } from '@/lib/auth';
import {
  User,
  CashAccount,
  CreateCashAccountInput,
  TreasuryTransfer,
  CreateTransferInput,
  TreasuryBalance,
  ArPayment,
  CreateArPaymentInput,
  ArPaymentFilters,
  ArAgingEntry,
  ApInvoice,
  CreateApInvoiceInput,
  ApInvoiceFilters,
  ApPaymentSchedule,
  CreateApPaymentScheduleInput,
  ApPaymentScheduleFilters,
} from './api';

const FINANCE_API_URL = process.env.FINANCE_API_URL || 'http://localhost:8000';
const FINANCE_API_KEY = process.env.FINANCE_API_KEY || '';
const PERMIT_API_URL = process.env.PERMIT_API_URL || 'http://localhost:8000';
const PERMIT_API_KEY = process.env.PERMIT_API_KEY || '';
const VENDOR_API_URL = process.env.VENDOR_API_URL || 'http://localhost:8000';
const VENDOR_API_KEY = process.env.VENDOR_API_KEY || '';
const PROCUREMENT_API_URL = process.env.PROCUREMENT_API_URL || 'http://localhost:8000';
const PROCUREMENT_API_KEY = process.env.PROCUREMENT_API_KEY || '';

if (!FINANCE_API_KEY) {
  console.warn('⚠️ FINANCE_API_KEY no está configurada.');
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  backend: 'finance' | 'permit' | 'vendor' | 'procurement' = 'finance'
): Promise<T> {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError('No autenticado', 401);
  }

  const baseUrl = backend === 'permit' ? PERMIT_API_URL 
    : backend === 'vendor' ? VENDOR_API_URL
    : backend === 'procurement' ? PROCUREMENT_API_URL
    : FINANCE_API_URL;
  const apiKey = backend === 'permit' ? PERMIT_API_KEY 
    : backend === 'vendor' ? VENDOR_API_KEY
    : backend === 'procurement' ? PROCUREMENT_API_KEY
    : FINANCE_API_KEY;
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

// Re-exportar tipos
export type {
  User,
  CashAccount,
  CreateCashAccountInput,
  TreasuryTransfer,
  CreateTransferInput,
  TreasuryBalance,
  ArPayment,
  CreateArPaymentInput,
  ArPaymentFilters,
  ArAgingEntry,
  ApInvoice,
  CreateApInvoiceInput,
  ApInvoiceFilters,
  ApPaymentSchedule,
  CreateApPaymentScheduleInput,
  ApPaymentScheduleFilters,
} from './api';

// ==================== USUARIOS ====================
export const usersApi = {
  getAll: async () => {
    const res = await fetchApi<{ data: User[] }>('/v1/users/', undefined, 'permit');
    return res.data;
  },
};

// ==================== TESORERÍA ====================
export const treasuryApi = {
  getCashAccounts: async (): Promise<CashAccount[]> => {
    const res = await fetchApi<{ data: CashAccount[] }>('/v1/treasury/cash-accounts');
    return res.data;
  },

  createCashAccount: async (data: CreateCashAccountInput): Promise<CashAccount> => {
    const res = await fetchApi<{ data: CashAccount }>('/v1/treasury/cash-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  getTransfers: async (cashAccountId?: number): Promise<TreasuryTransfer[]> => {
    const params = cashAccountId ? `?cashAccountId=${cashAccountId}` : '';
    const res = await fetchApi<{ data: TreasuryTransfer[] }>(`/v1/treasury/transfers${params}`);
    return res.data;
  },

  createTransfer: async (data: CreateTransferInput): Promise<TreasuryTransfer> => {
    const res = await fetchApi<{ data: TreasuryTransfer }>('/v1/treasury/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  getBalances: async (): Promise<TreasuryBalance[]> => {
    const res = await fetchApi<{ data: TreasuryBalance[] }>('/v1/treasury/balances');
    return res.data;
  },
};

// ==================== CUENTAS POR COBRAR (AR) ====================
export const arApi = {
  getPayments: async (filters?: ArPaymentFilters): Promise<ArPayment[]> => {
    const params = new URLSearchParams();
    if (filters?.customerId) params.set('customerId', filters.customerId.toString());
    if (filters?.orderId) params.set('orderId', filters.orderId.toString());
    
    const query = params.toString();
    const res = await fetchApi<{ data: ArPayment[] }>(
      `/v1/ar/payments${query ? `?${query}` : ''}`
    );
    return res.data;
  },

  createPayment: async (data: CreateArPaymentInput): Promise<ArPayment> => {
    const res = await fetchApi<{ data: ArPayment }>('/v1/ar/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  getAging: async (): Promise<ArAgingEntry[]> => {
    const res = await fetchApi<{ data: ArAgingEntry[] }>('/v1/ar/aging');
    return res.data;
  },
};

// ==================== CUENTAS POR PAGAR (AP) ====================
export const apApi = {
  getInvoices: async (filters?: ApInvoiceFilters): Promise<ApInvoice[]> => {
    const params = new URLSearchParams();
    if (filters?.supplierId) params.set('supplierId', filters.supplierId.toString());
    
    const query = params.toString();
    const res = await fetchApi<{ data: ApInvoice[] }>(
      `/v1/ap/invoices${query ? `?${query}` : ''}`
    );
    return res.data;
  },

  createInvoice: async (data: CreateApInvoiceInput): Promise<ApInvoice> => {
    const res = await fetchApi<{ data: ApInvoice }>('/v1/ap/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  getPaymentSchedules: async (filters?: ApPaymentScheduleFilters): Promise<ApPaymentSchedule[]> => {
    const params = new URLSearchParams();
    if (filters?.invoiceId) params.set('invoiceId', filters.invoiceId.toString());
    
    const query = params.toString();
    const res = await fetchApi<{ data: ApPaymentSchedule[] }>(
      `/v1/ap/payment-schedules${query ? `?${query}` : ''}`
    );
    return res.data;
  },

  createPaymentSchedule: async (data: CreateApPaymentScheduleInput): Promise<ApPaymentSchedule> => {
    const res = await fetchApi<{ data: ApPaymentSchedule }>('/v1/ap/payment-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};
