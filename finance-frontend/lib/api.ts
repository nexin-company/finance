/**
 * Cliente API para comunicarse con las rutas API de Next.js
 * Las rutas API actúan como proxy y manejan la autenticación y API key server-side
 */

const FINANCE_API_BASE_URL = '/api/finance/v1';
const VENDOR_API_BASE_URL = '/api/vendor/v1';
const PROCUREMENT_API_BASE_URL = '/api/procurement/v1';
const PERMIT_API_BASE_URL = '/api/permit/v1';

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
  baseUrl: string,
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${baseUrl}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

// ==================== USUARIOS ====================

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string | Date;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return fetchApi<User[]>(PERMIT_API_BASE_URL, '/users/');
  },
};

// ==================== TESORERÍA ====================

export type CashAccountType = 'bank' | 'cash';
export type TreasuryTransferStatus = 'pending' | 'posted' | 'cancelled';

export interface CashAccount {
  id: number;
  name: string;
  type: CashAccountType;
  currency: string;
  createdAt: string | Date;
}

export interface TreasuryTransfer {
  id: number;
  cashAccountId?: number;
  cashAccount?: CashAccount;
  amount: string;
  reference?: string;
  notes?: string;
  status: TreasuryTransferStatus;
  occurredAt: string | Date;
  createdAt: string | Date;
}

export interface TreasuryBalance {
  cashAccountId: number;
  cashAccount?: CashAccount;
  balance: string;
  currency: string;
}

export interface CreateCashAccountInput {
  name: string;
  type?: CashAccountType;
  currency?: string;
}

export interface CreateTransferInput {
  cashAccountId?: number;
  amount: number;
  reference?: string;
  notes?: string;
  occurredAt?: string;
}

export const treasuryApi = {
  getCashAccounts: async (): Promise<CashAccount[]> => {
    const res = await fetchApi<{ data: CashAccount[] }>(FINANCE_API_BASE_URL, '/treasury/cash-accounts');
    return res.data;
  },

  createCashAccount: async (data: CreateCashAccountInput): Promise<CashAccount> => {
    const res = await fetchApi<{ data: CashAccount }>(FINANCE_API_BASE_URL, '/treasury/cash-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  getTransfers: async (cashAccountId?: number): Promise<TreasuryTransfer[]> => {
    const params = cashAccountId ? `?cashAccountId=${cashAccountId}` : '';
    const res = await fetchApi<{ data: TreasuryTransfer[] }>(FINANCE_API_BASE_URL, `/treasury/transfers${params}`);
    return res.data;
  },

  createTransfer: async (data: CreateTransferInput): Promise<TreasuryTransfer> => {
    const res = await fetchApi<{ data: TreasuryTransfer }>(FINANCE_API_BASE_URL, '/treasury/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  getBalances: async (): Promise<TreasuryBalance[]> => {
    const res = await fetchApi<{ data: TreasuryBalance[] }>(FINANCE_API_BASE_URL, '/treasury/balances');
    return res.data;
  },
};

// ==================== CUENTAS POR COBRAR (AR) ====================

export type ArPaymentMethod = 'bank_transfer';
export type ArPaymentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ArPayment {
  id: number;
  externalRef?: string;
  customerId: number;
  orderId?: number;
  amount: string;
  currency: string;
  method: ArPaymentMethod;
  status: ArPaymentStatus;
  reference?: string;
  proofUrl?: string;
  notes?: string;
  paidAt: string | Date;
  createdAt: string | Date;
}

export interface ArAgingEntry {
  customerId: number;
  customerName?: string;
  total: string;
  current: string;
  days30: string;
  days60: string;
  days90: string;
  days90Plus: string;
}

export interface CreateArPaymentInput {
  customerId: number;
  orderId?: number;
  amount: number;
  currency?: string;
  method?: ArPaymentMethod;
  externalRef?: string;
  reference?: string;
  proofUrl?: string;
  notes?: string;
  paidAt?: string;
}

export interface ArPaymentFilters {
  customerId?: number;
  orderId?: number;
}

export const arApi = {
  getPayments: async (filters?: ArPaymentFilters): Promise<ArPayment[]> => {
    const params = new URLSearchParams();
    if (filters?.customerId) params.set('customerId', filters.customerId.toString());
    if (filters?.orderId) params.set('orderId', filters.orderId.toString());
    
    const query = params.toString();
    const res = await fetchApi<{ data: ArPayment[] }>(
      FINANCE_API_BASE_URL,
      `/ar/payments${query ? `?${query}` : ''}`
    );
    return res.data;
  },

  createPayment: async (data: CreateArPaymentInput): Promise<ArPayment> => {
    const res = await fetchApi<{ data: ArPayment }>(FINANCE_API_BASE_URL, '/ar/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  getAging: async (): Promise<ArAgingEntry[]> => {
    const res = await fetchApi<{ data: ArAgingEntry[] }>(FINANCE_API_BASE_URL, '/ar/aging');
    return res.data;
  },
};

// ==================== CUENTAS POR PAGAR (AP) ====================

export type ApInvoiceStatus = 'draft' | 'approved' | 'scheduled' | 'paid' | 'cancelled';
export type ApPaymentScheduleStatus = 'scheduled' | 'paid' | 'cancelled';

export interface ApInvoice {
  id: number;
  externalRef?: string;
  supplierId: number;
  procurementReceiptId?: number;
  invoiceNumber?: string;
  currency: string;
  amount: string;
  status: ApInvoiceStatus;
  dueDate?: string | Date;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApPaymentSchedule {
  id: number;
  invoiceId: number;
  invoice?: ApInvoice;
  dueDate: string | Date;
  amount: string;
  status: ApPaymentScheduleStatus;
  createdAt: string | Date;
}

export interface CreateApInvoiceInput {
  supplierId: number;
  procurementReceiptId?: number;
  invoiceNumber?: string;
  currency?: string;
  amount: number;
  externalRef?: string;
  dueDate?: string;
  notes?: string;
}

export interface CreateApPaymentScheduleInput {
  invoiceId: number;
  dueDate: string;
  amount: number;
}

export interface ApInvoiceFilters {
  supplierId?: number;
}

export interface ApPaymentScheduleFilters {
  invoiceId?: number;
}

export const apApi = {
  getInvoices: async (filters?: ApInvoiceFilters): Promise<ApInvoice[]> => {
    const params = new URLSearchParams();
    if (filters?.supplierId) params.set('supplierId', filters.supplierId.toString());
    
    const query = params.toString();
    const res = await fetchApi<{ data: ApInvoice[] }>(
      FINANCE_API_BASE_URL,
      `/ap/invoices${query ? `?${query}` : ''}`
    );
    return res.data;
  },

  createInvoice: async (data: CreateApInvoiceInput): Promise<ApInvoice> => {
    const res = await fetchApi<{ data: ApInvoice }>(FINANCE_API_BASE_URL, '/ap/invoices', {
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
      FINANCE_API_BASE_URL,
      `/ap/payment-schedules${query ? `?${query}` : ''}`
    );
    return res.data;
  },

  createPaymentSchedule: async (data: CreateApPaymentScheduleInput): Promise<ApPaymentSchedule> => {
    const res = await fetchApi<{ data: ApPaymentSchedule }>(FINANCE_API_BASE_URL, '/ap/payment-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },
};

// ==================== VENDOR (para consultas) ====================

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Order {
  id: number;
  customerId: number;
  status: string;
  total: string;
}

export const vendorApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const res = await fetchApi<{ data: Customer[] }>(VENDOR_API_BASE_URL, '/customers');
    return res.data;
  },

  getOrders: async (customerId?: number): Promise<Order[]> => {
    const params = customerId ? `?customerId=${customerId}` : '';
    const res = await fetchApi<{ data: Order[] }>(VENDOR_API_BASE_URL, `/orders${params}`);
    return res.data;
  },
};

// ==================== PROCUREMENT (para consultas) ====================

export interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const procurementApi = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await fetchApi<{ data: Supplier[] }>(PROCUREMENT_API_BASE_URL, '/suppliers');
    return res.data;
  },
};

// ==================== NOTIFICACIONES ====================

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string | Date;
}

export const notificationsApi = {
  getUnreadCount: async (userId: number): Promise<{ count: number }> => {
    return fetchApi<{ count: number }>(PERMIT_API_BASE_URL, `/notifications/${userId}/unread-count`);
  },

  getAll: async (userId: number): Promise<Notification[]> => {
    return fetchApi<Notification[]>(PERMIT_API_BASE_URL, `/notifications/${userId}`);
  },

  markAsRead: async (notificationId: number): Promise<void> => {
    await fetchApi<void>(PERMIT_API_BASE_URL, `/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async (userId: number): Promise<void> => {
    await fetchApi<void>(PERMIT_API_BASE_URL, `/notifications/${userId}/read-all`, {
      method: 'PUT',
    });
  },
};
