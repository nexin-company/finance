'use client';

import { usePathname } from 'next/navigation';

export function PageTitle() {
  const pathname = usePathname();
  
  const pageTitles: Record<string, string> = {
    '/': 'Home',
    '/treasury/cash-accounts': 'Tesorería - Cuentas',
    '/treasury/transfers': 'Tesorería - Transferencias',
    '/treasury/balances': 'Tesorería - Balances',
    '/ar/payments': 'Cuentas por Cobrar - Pagos',
    '/ar/aging': 'Cuentas por Cobrar - Aging',
    '/ap/invoices': 'Cuentas por Pagar - Facturas',
    '/ap/payment-schedules': 'Cuentas por Pagar - Programación',
    '/users': 'Usuarios',
    '/settings': 'Configuración'
  };
  
  // Intentar encontrar una coincidencia exacta primero
  let title = pageTitles[pathname];
  
  // Si no hay coincidencia exacta, buscar por prefijo (para rutas anidadas)
  if (!title) {
    const matchingPath = Object.keys(pageTitles).find(path => 
      pathname.startsWith(path) && path !== '/'
    );
    title = matchingPath ? pageTitles[matchingPath] : 'Home';
  }
  
  return (
    <h1 className="font-semibold text-lg md:text-xl hidden md:block">
      {title}
    </h1>
  );
}
