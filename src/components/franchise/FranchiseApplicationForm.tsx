'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { franchiseApplicationSchema, type FranchiseApplicationFormValues } from '@/lib/validation';
import { FormField, inputClass } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { investmentBudgetOptions } from '@/data/franchise';

export function FranchiseApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FranchiseApplicationFormValues>({ resolver: zodResolver(franchiseApplicationSchema) });

  const onSubmit = async (data: FranchiseApplicationFormValues) => {
    // TODO: replace with a real backend/CRM endpoint once available.
    // eslint-disable-next-line no-console
    console.log('Franchise application (placeholder):', data);
    await new Promise((r) => setTimeout(r, 400));
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="rounded-xl2 border border-tbc-emerald-700/50 bg-tbc-emerald-900/30 p-6 text-sm text-tbc-emerald-200">
        Thank you for your interest! Our franchise team will contact you within 2–3 business days.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="franchise-name" label="Full Name" error={errors.name?.message}>
          <input id="franchise-name" {...register('name')} className={inputClass} autoComplete="name" />
        </FormField>
        <FormField id="franchise-phone" label="Phone" error={errors.phone?.message}>
          <input id="franchise-phone" {...register('phone')} className={inputClass} autoComplete="tel" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="franchise-email" label="Email" error={errors.email?.message}>
          <input id="franchise-email" {...register('email')} type="email" className={inputClass} autoComplete="email" />
        </FormField>
        <FormField id="franchise-city" label="Preferred City" error={errors.city?.message}>
          <input id="franchise-city" {...register('city')} className={inputClass} />
        </FormField>
      </div>
      <FormField id="franchise-investment" label="Investment Budget" error={errors.investmentBudget?.message}>
        <select id="franchise-investment" {...register('investmentBudget')} className={inputClass} defaultValue="">
          <option value="" disabled>
            Select a range
          </option>
          {investmentBudgetOptions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </FormField>
      <FormField id="franchise-experience" label="Relevant Business/F&B Experience (optional)" error={errors.experience?.message}>
        <input id="franchise-experience" {...register('experience')} className={inputClass} />
      </FormField>
      <FormField id="franchise-message" label="Additional Details (optional)" error={errors.message?.message}>
        <textarea id="franchise-message" {...register('message')} className={cn(inputClass, 'min-h-[100px] resize-y')} />
      </FormField>
      <Button type="submit" variant="gold" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Submitting…' : 'Submit Application'}
      </Button>
    </form>
  );
}
