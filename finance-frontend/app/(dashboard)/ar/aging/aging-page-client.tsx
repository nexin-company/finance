'use client';

import { ArAgingEntry } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AgingPageClientProps {
  initialAging: ArAgingEntry[];
}

export function AgingPageClient({ initialAging }: AgingPageClientProps) {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Reporte de Aging (Cuentas por Cobrar)</CardTitle>
          <CardDescription>
            Análisis de antigüedad de saldos por cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Al día</TableHead>
                <TableHead className="text-right">1-30 días</TableHead>
                <TableHead className="text-right">31-60 días</TableHead>
                <TableHead className="text-right">61-90 días</TableHead>
                <TableHead className="text-right">+90 días</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialAging.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No hay datos de aging disponibles
                  </TableCell>
                </TableRow>
              ) : (
                initialAging.map((entry) => (
                  <TableRow key={entry.customerId}>
                    <TableCell className="font-medium">
                      {entry.customerName || `Cliente ${entry.customerId}`}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(Number(entry.total))}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(Number(entry.current))}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(Number(entry.days30))}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(Number(entry.days60))}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(Number(entry.days90))}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(Number(entry.days90Plus))}
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

