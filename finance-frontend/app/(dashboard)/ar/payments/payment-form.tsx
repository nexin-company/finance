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
import { arApi, vendorApi, type CreateArPaymentInput, type Customer, type Order } from '@/lib/api';

const paymentSchema = z.object({
  customerId: z.number().min(1, 'Selecciona un cliente'),
  orderId: z.number().optional(),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  currency: z.string().optional(),
  method: z.enum(['bank_transfer']).optional(),
  reference: z.string().optional(),
  proofUrl: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      currency: 'MXN',
      method: 'bank_transfer',
      paidAt: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const customersData = await vendorApi.getCustomers();
        setCustomers(customersData);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      (async () => {
        try {
          const ordersData = await vendorApi.getOrders(selectedCustomerId);
          setOrders(ordersData);
        } catch (error) {
          console.error('Error al cargar órdenes:', error);
        }
      })();
    } else {
      setOrders([]);
    }
  }, [selectedCustomerId]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const payload: CreateArPaymentInput = {
        customerId: data.customerId,
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        reference: data.reference,
        proofUrl: data.proofUrl,
        notes: data.notes,
        paidAt: data.paidAt,
      };
      await arApi.createPayment(payload);
      toast.success('Pago registrado', 'El pago se registró correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar pago:', error);
      toast.error('Error al guardar pago', error.message || 'No se pudo guardar el pago');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <Label htmlFor="customerId">Cliente *</Label>
        <Select
          value={watch('customerId') ? String(watch('customerId')) : undefined}
          onValueChange={(v) => {
            setValue('customerId', Number(v));
            setSelectedCustomerId(Number(v));
            setValue('orderId', undefined);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un cliente" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={String(customer.id)}>
                {customer.name} ({customer.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && <FormError>{errors.customerId.message}</FormError>}
      </FormField>

      <FormField>
        <Label htmlFor="orderId">Orden (opcional)</Label>
        <Select
          value={watch('orderId') ? String(watch('orderId')) : undefined}
          onValueChange={(v) => setValue('orderId', Number(v))}
          disabled={!selectedCustomerId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una orden (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin orden</SelectItem>
            {orders.map((order) => (
              <SelectItem key={order.id} value={String(order.id)}>
                Orden #{order.id} - {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                }).format(Number(order.total))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

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
        <Label htmlFor="reference">Referencia</Label>
        <Input id="reference" {...register('reference')} placeholder="Número de referencia" />
      </FormField>

      <FormField>
        <Label htmlFor="proofUrl">URL de comprobante</Label>
        <Input id="proofUrl" type="url" {...register('proofUrl')} placeholder="https://..." />
      </FormField>

      <FormField>
        <Label htmlFor="notes">Notas</Label>
        <Input id="notes" {...register('notes')} placeholder="Notas adicionales" />
      </FormField>

      <FormField>
        <Label htmlFor="paidAt">Fecha de pago</Label>
        <Input id="paidAt" type="date" {...register('paidAt')} />
      </FormField>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Registrar'}
        </Button>
      </div>
    </form>
  );
}

