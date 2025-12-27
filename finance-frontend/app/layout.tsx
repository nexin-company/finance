import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Finance - Sistema Financiero',
  description:
    'Sistema de gestión financiera. Administra tesorería, cuentas por cobrar y cuentas por pagar.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Analytics />
    </html>
  );
}

