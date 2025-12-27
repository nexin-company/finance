'use client';

import { useState } from 'react';
import { ArPayment, arApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { PaymentForm } from './payment-form';

interface ArPaymentsPageClientProps {
  initialPayments: ArPayment[];
}

export function ArPaymentsPageClient({ initialPayments }: ArPaymentsPageClientProps) {
  const [payments, setPayments] = useState<ArPayment[]>(initialPayments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRefresh = async () => {
    try {
      const data = await arApi.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error al refrescar pagos:', error);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Pagos (Cuentas por Cobrar)</h2>
              <p className="text-sm text-muted-foreground">
                Registra pagos de clientes
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Registrar pago</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar pago</DialogTitle>
                  <DialogDescription>
                    Registra un nuevo pago de cliente
                  </DialogDescription>
                </DialogHeader>
                <PaymentForm
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
                <TableHead>Cliente ID</TableHead>
                <TableHead>Orden ID</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No se encontraron pagos. Registra uno nuevo para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">Cliente #{payment.customerId}</TableCell>
                    <TableCell>
                      {payment.orderId ? `Orden #${payment.orderId}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: payment.currency,
                      }).format(Number(payment.amount))}
                    </TableCell>
                    <TableCell>
                      {payment.method === 'bank_transfer' ? 'Transferencia' : payment.method}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'confirmed' ? 'default' : 'secondary'}>
                        {payment.status === 'confirmed' ? 'Confirmado' : payment.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(payment.paidAt).toLocaleDateString('es-ES', {
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

