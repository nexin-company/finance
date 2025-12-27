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
import { apApi, type CreateApPaymentScheduleInput, type ApInvoice } from '@/lib/api';

const paymentScheduleSchema = z.object({
  invoiceId: z.number().min(1, 'Selecciona una factura'),
  dueDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
});

type PaymentScheduleFormData = z.infer<typeof paymentScheduleSchema>;

interface PaymentScheduleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentScheduleForm({ onSuccess, onCancel }: PaymentScheduleFormProps) {
  const [invoices, setInvoices] = useState<ApInvoice[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<PaymentScheduleFormData>({
    resolver: zodResolver(paymentScheduleSchema),
    defaultValues: {
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const invoicesData = await apApi.getInvoices();
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Error al cargar facturas:', error);
      }
    })();
  }, []);

  const onSubmit = async (data: PaymentScheduleFormData) => {
    try {
      const payload: CreateApPaymentScheduleInput = {
        invoiceId: data.invoiceId,
        dueDate: data.dueDate,
        amount: data.amount,
      };
      await apApi.createPaymentSchedule(payload);
      toast.success('Programación creada', 'La programación se creó correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar programación:', error);
      toast.error('Error al guardar programación', error.message || 'No se pudo guardar la programación');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <Label htmlFor="invoiceId">Factura *</Label>
        <Select
          value={watch('invoiceId') ? String(watch('invoiceId')) : undefined}
          onValueChange={(v) => setValue('invoiceId', Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una factura" />
          </SelectTrigger>
          <SelectContent>
            {invoices.map((invoice) => (
              <SelectItem key={invoice.id} value={String(invoice.id)}>
                Factura #{invoice.id} - {invoice.invoiceNumber || 'Sin número'} - {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: invoice.currency,
                }).format(Number(invoice.amount))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.invoiceId && <FormError>{errors.invoiceId.message}</FormError>}
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField>
          <Label htmlFor="dueDate">Fecha de vencimiento *</Label>
          <Input
            id="dueDate"
            type="date"
            {...register('dueDate')}
            aria-invalid={errors.dueDate ? 'true' : 'false'}
          />
          {errors.dueDate && <FormError>{errors.dueDate.message}</FormError>}
        </FormField>

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
      </div>

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

