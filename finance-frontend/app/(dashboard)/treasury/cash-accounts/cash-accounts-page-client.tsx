'use client';

import { useState } from 'react';
import { CashAccount, treasuryApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { CashAccountForm } from './cash-account-form';

interface CashAccountsPageClientProps {
  initialCashAccounts: CashAccount[];
}

export function CashAccountsPageClient({ initialCashAccounts }: CashAccountsPageClientProps) {
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>(initialCashAccounts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRefresh = async () => {
    try {
      const data = await treasuryApi.getCashAccounts();
      setCashAccounts(data);
    } catch (error) {
      console.error('Error al refrescar cuentas:', error);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Cuentas de Tesorería</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona las cuentas bancarias y de efectivo
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Nueva cuenta</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva cuenta de tesorería</DialogTitle>
                  <DialogDescription>
                    Crea una nueva cuenta bancaria o de efectivo
                  </DialogDescription>
                </DialogHeader>
                <CashAccountForm
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    handleRefresh();
                  }}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead className="hidden md:table-cell">Creada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No se encontraron cuentas. Crea una nueva para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                cashAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>
                      <Badge variant={account.type === 'bank' ? 'default' : 'secondary'}>
                        {account.type === 'bank' ? 'Banco' : 'Efectivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.currency}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(account.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
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

