'use client';

import { useState } from 'react';
import { ApInvoice, apApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/toast';
import { InvoiceForm } from './invoice-form';

interface ApInvoicesPageClientProps {
  initialInvoices: ApInvoice[];
  prefillSupplierId?: number;
  prefillReceiptId?: number;
}

function statusLabel(status: ApInvoice['status']) {
  switch (status) {
    case 'draft':
      return 'Borrador';
    case 'approved':
      return 'Aprobada';
    case 'scheduled':
      return 'Programada';
    case 'paid':
      return 'Pagada';
    case 'cancelled':
      return 'Cancelada';
    default:
      return status;
  }
}

function statusVariant(status: ApInvoice['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'paid':
      return 'default';
    case 'cancelled':
      return 'destructive';
    case 'draft':
      return 'secondary';
    case 'approved':
    case 'scheduled':
      return 'outline';
    default:
      return 'outline';
  }
}

export function ApInvoicesPageClient({ initialInvoices, prefillSupplierId, prefillReceiptId }: ApInvoicesPageClientProps) {
  const [invoices, setInvoices] = useState<ApInvoice[]>(initialInvoices);
  const [isDialogOpen, setIsDialogOpen] = useState(!!prefillSupplierId);

  const handleRefresh = async () => {
    try {
      const data = await apApi.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error al refrescar facturas:', error);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Facturas (Cuentas por Pagar)</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona facturas de proveedores
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Nueva factura</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nueva factura</DialogTitle>
                  <DialogDescription>
                    Registra una nueva factura de proveedor
                  </DialogDescription>
                </DialogHeader>
                <InvoiceForm
                  prefillSupplierId={prefillSupplierId}
                  prefillReceiptId={prefillReceiptId}
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
                <TableHead>Proveedor ID</TableHead>
                <TableHead>Número</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Vencimiento</TableHead>
                <TableHead className="hidden md:table-cell">Creada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No se encontraron facturas. Crea una nueva para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">Proveedor #{invoice.supplierId}</TableCell>
                    <TableCell>{invoice.invoiceNumber || `#${invoice.id}`}</TableCell>
                    <TableCell className="text-right font-medium">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: invoice.currency,
                      }).format(Number(invoice.amount))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(invoice.status)}>
                        {statusLabel(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) : '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(invoice.createdAt).toLocaleDateString('es-ES', {
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

