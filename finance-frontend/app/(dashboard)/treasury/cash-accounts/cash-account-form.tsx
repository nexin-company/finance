'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormError } from '@/components/ui/form';
import { toast } from '@/lib/toast';
import { z } from 'zod';
import { treasuryApi, type CreateCashAccountInput } from '@/lib/api';

const cashAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['bank', 'cash']).optional(),
  currency: z.string().optional(),
});

type CashAccountFormData = z.infer<typeof cashAccountSchema>;

interface CashAccountFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CashAccountForm({ onSuccess, onCancel }: CashAccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<CashAccountFormData>({
    resolver: zodResolver(cashAccountSchema),
    defaultValues: {
      name: '',
      type: 'bank',
      currency: 'MXN',
    },
  });

  const type = watch('type');

  const onSubmit = async (data: CashAccountFormData) => {
    try {
      const payload: CreateCashAccountInput = {
        name: data.name,
        type: data.type,
        currency: data.currency,
      };
      await treasuryApi.createCashAccount(payload);
      toast.success('Cuenta creada', 'La cuenta se creó correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error al guardar cuenta:', error);
      toast.error('Error al guardar cuenta', error.message || 'No se pudo guardar la cuenta');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField>
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" {...register('name')} placeholder="Nombre de la cuenta" aria-invalid={errors.name ? 'true' : 'false'} />
        {errors.name && <FormError>{errors.name.message}</FormError>}
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField>
          <Label htmlFor="type">Tipo</Label>
          <Select value={type} onValueChange={(v) => setValue('type', v as 'bank' | 'cash')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Banco</SelectItem>
              <SelectItem value="cash">Efectivo</SelectItem>
            </SelectContent>
          </Select>
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

