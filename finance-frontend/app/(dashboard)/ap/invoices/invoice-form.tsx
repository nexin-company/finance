'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormError } from '@/components/ui/form';
import { toast } from '@/lib/toast';
import { z } from 'zod';
import { apApi, procurementApi, type CreateApInvoiceInput, type Supplier } from '@/lib/api';

const invoiceSchema = z.object({
  supplierId: z.number().min(1, 'Selecciona un proveedor'),
  procurementReceiptId: z.number().optional(),
  invoiceNumber: z.string().optional(),
  currency: z.string().optional(),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  prefillSupplierId?: number;
  prefillReceiptId?: number;
}

export function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      currency: 'MXN',
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const suppliersData = await procurementApi.getSuppliers();
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error al cargar proveedores:', error);
      }
    })();
  }, []);

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      const payload: CreateApInvoiceInput = {
        supplierId: data.supplierId,
        procurementReceiptId: data.procurementReceiptId,
        invoiceNumber: data.invoiceNumber,
        currency: data.currency,
        amount: data.amount,
        dueDate: data.dueDate,
        notes: data.notes,
      };
      await apApi.createInvoice(payload);
      toast.success('Factura creada', 'La factura se creó correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar factura:', error);
      toast.error('Error al guardar factura', error.message || 'No se pudo guardar la factura');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <Label htmlFor="supplierId">Proveedor *</Label>
        <Select
          value={watch('supplierId') ? String(watch('supplierId')) : undefined}
          onValueChange={(v) => setValue('supplierId', Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un proveedor" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={String(supplier.id)}>
                {supplier.name} {supplier.email ? `(${supplier.email})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.supplierId && <FormError>{errors.supplierId.message}</FormError>}
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField>
          <Label htmlFor="invoiceNumber">Número de factura</Label>
          <Input id="invoiceNumber" {...register('invoiceNumber')} placeholder="Número de factura" />
        </FormField>

        <FormField>
          <Label htmlFor="procurementReceiptId">Recepción ID (opcional)</Label>
          <Input
            id="procurementReceiptId"
            type="number"
            {...register('procurementReceiptId', { valueAsNumber: true })}
            placeholder="ID de recepción"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField>
          <Label htmlFor="amount">Monto *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            placeholder="0.00"
            aria-invalid={errors.amount ? 'true' : 'false'}
          />
          {errors.amount && <FormError>{errors.amount.message}</FormError>}
        </FormField>

        <FormField>
          <Label htmlFor="currency">Moneda</Label>
          <Select value={watch('currency')} onValueChange={(v) => setValue('currency', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MXN">MXN</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField>
        <Label htmlFor="dueDate">Fecha de vencimiento</Label>
        <Input id="dueDate" type="date" {...register('dueDate')} />
      </FormField>

      <FormField>
        <Label htmlFor="notes">Notas</Label>
        <Input id="notes" {...register('notes')} placeholder="Notas adicionales" />
      </FormField>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

