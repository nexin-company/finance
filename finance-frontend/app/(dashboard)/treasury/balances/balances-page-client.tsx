'use client';

import { TreasuryBalance } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface BalancesPageClientProps {
  initialBalances: TreasuryBalance[];
}

export function BalancesPageClient({ initialBalances }: BalancesPageClientProps) {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Balances de Tesorería</CardTitle>
          <CardDescription>
            Resumen de balances por cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuenta</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Moneda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialBalances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay balances disponibles
                  </TableCell>
                </TableRow>
              ) : (
                initialBalances.map((balance) => (
                  <TableRow key={balance.cashAccountId}>
                    <TableCell className="font-medium">
                      {balance.cashAccount?.name || `Cuenta ${balance.cashAccountId}`}
                    </TableCell>
                    <TableCell>
                      {balance.cashAccount?.type === 'bank' ? 'Banco' : 'Efectivo'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: balance.currency,
                      }).format(Number(balance.balance))}
                    </TableCell>
                    <TableCell>{balance.currency}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

