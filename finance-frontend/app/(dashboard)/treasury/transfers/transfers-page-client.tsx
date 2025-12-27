'use client';

import { useState } from 'react';
import { TreasuryTransfer, treasuryApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { TransferForm } from './transfer-form';

interface TransfersPageClientProps {
  initialTransfers: TreasuryTransfer[];
}

export function TransfersPageClient({ initialTransfers }: TransfersPageClientProps) {
  const [transfers, setTransfers] = useState<TreasuryTransfer[]>(initialTransfers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRefresh = async () => {
    try {
      const data = await treasuryApi.getTransfers();
      setTransfers(data);
    } catch (error) {
      console.error('Error al refrescar transferencias:', error);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Transferencias</h2>
              <p className="text-sm text-muted-foreground">
                Registra transferencias de tesorería
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Nueva transferencia</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva transferencia</DialogTitle>
                  <DialogDescription>
                    Registra una nueva transferencia de tesorería
                  </DialogDescription>
                </DialogHeader>
                <TransferForm
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
                <TableHead>Cuenta</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No se encontraron transferencias. Crea una nueva para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      {transfer.cashAccount?.name || `Cuenta ${transfer.cashAccountId || 'N/A'}`}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(Number(transfer.amount))}
                    </TableCell>
                    <TableCell>{transfer.reference || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={transfer.status === 'posted' ? 'default' : 'secondary'}>
                        {transfer.status === 'posted' ? 'Publicada' : transfer.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(transfer.occurredAt).toLocaleDateString('es-ES', {
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

