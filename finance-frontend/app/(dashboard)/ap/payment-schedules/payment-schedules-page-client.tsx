'use client';

import { useState } from 'react';
import { ApPaymentSchedule, apApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { PaymentScheduleForm } from './payment-schedule-form';

interface PaymentSchedulesPageClientProps {
  initialSchedules: ApPaymentSchedule[];
}

export function PaymentSchedulesPageClient({ initialSchedules }: PaymentSchedulesPageClientProps) {
  const [schedules, setSchedules] = useState<ApPaymentSchedule[]>(initialSchedules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleRefresh = async () => {
    try {
      const data = await apApi.getPaymentSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error al refrescar programación:', error);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Programación de Pagos</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona la programación de pagos de facturas
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Nueva programación</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva programación de pago</DialogTitle>
                  <DialogDescription>
                    Programa un pago para una factura
                  </DialogDescription>
                </DialogHeader>
                <PaymentScheduleForm
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
                <TableHead>Factura ID</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Fecha de vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Creada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No se encontraron programaciones. Crea una nueva para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">Factura #{schedule.invoiceId}</TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(Number(schedule.amount))}
                    </TableCell>
                    <TableCell>
                      {new Date(schedule.dueDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={schedule.status === 'paid' ? 'default' : 'secondary'}>
                        {schedule.status === 'paid' ? 'Pagado' : schedule.status === 'scheduled' ? 'Programado' : 'Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(schedule.createdAt).toLocaleDateString('es-ES', {
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

