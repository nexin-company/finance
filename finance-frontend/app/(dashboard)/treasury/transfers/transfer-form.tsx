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
import { treasuryApi, type CreateTransferInput, type CashAccount } from '@/lib/api';

const transferSchema = z.object({
  cashAccountId: z.number().optional(),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  occurredAt: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: 0,
      occurredAt: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const accounts = await treasuryApi.getCashAccounts();
        setCashAccounts(accounts);
      } catch (error) {
        console.error('Error al cargar cuentas:', error);
      }
    })();
  }, []);

  const onSubmit = async (data: TransferFormData) => {
    try {
      const payload: CreateTransferInput = {
        cashAccountId: data.cashAccountId,
        amount: data.amount,
        reference: data.reference,
        notes: data.notes,
        occurredAt: data.occurredAt,
      };
      await treasuryApi.createTransfer(payload);
      toast.success('Transferencia creada', 'La transferencia se registró correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar transferencia:', error);
      toast.error('Error al guardar transferencia', error.message || 'No se pudo guardar la transferencia');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <Label htmlFor="cashAccountId">Cuenta (opcional)</Label>
        <Select
          value={watch('cashAccountId') ? String(watch('cashAccountId')) : undefined}
          onValueChange={(v) => setValue('cashAccountId', Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una cuenta (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin cuenta</SelectItem>
            {cashAccounts.map((account) => (
              <SelectItem key={account.id} value={String(account.id)}>
                {account.name} ({account.type === 'bank' ? 'Banco' : 'Efectivo'})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      <FormField>
        <Label htmlFor="reference">Referencia</Label>
        <Input id="reference" {...register('reference')} placeholder="Número de referencia" />
      </FormField>

      <FormField>
        <Label htmlFor="notes">Notas</Label>
        <Input id="notes" {...register('notes')} placeholder="Notas adicionales" />
      </FormField>

      <FormField>
        <Label htmlFor="occurredAt">Fecha</Label>
        <Input id="occurredAt" type="date" {...register('occurredAt')} />
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

