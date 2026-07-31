'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cateringEnquirySchema, type CateringEnquiryFormValues } from '@/lib/validation';
import { FormField, inputClass } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { cateringOccasions } from '@/data/catering';

export function CateringEnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CateringEnquiryFormValues>({ resolver: zodResolver(cateringEnquirySchema) });

  const onSubmit = async (data: CateringEnquiryFormValues) => {
    // TODO: replace with a real backend/CRM endpoint once available.
    // eslint-disable-next-line no-console
    console.log('Catering enquiry (placeholder):', data);
    await new Promise((r) => setTimeout(r, 400));
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="rounded-xl2 border border-tbc-emerald-700/50 bg-tbc-emerald-900/30 p-6 text-sm text-tbc-emerald-200">
        Thanks! Your catering enquiry has been received — our team will reach out within 24 hours.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="catering-name" label="Name" error={errors.name?.message}>
          <input id="catering-name" {...register('name')} className={inputClass} autoComplete="name" />
        </FormField>
        <FormField id="catering-phone" label="Phone" error={errors.phone?.message}>
          <input id="catering-phone" {...register('phone')} className={inputClass} autoComplete="tel" />
        </FormField>
      </div>
      <FormField id="catering-email" label="Email" error={errors.email?.message}>
        <input id="catering-email" {...register('email')} type="email" className={inputClass} autoComplete="email" />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField id="catering-event-type" label="Event Type" error={errors.eventType?.message}>
          <select id="catering-event-type" {...register('eventType')} className={inputClass} defaultValue="">
            <option value="" disabled>
              Select
            </option>
            {cateringOccasions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="catering-event-date" label="Event Date" error={errors.eventDate?.message}>
          <input id="catering-event-date" {...register('eventDate')} type="date" className={inputClass} />
        </FormField>
        <FormField id="catering-guest-count" label="Guest Count" error={errors.guestCount?.message}>
          <input id="catering-guest-count" {...register('guestCount')} type="number" min={1} className={inputClass} />
        </FormField>
      </div>
      <FormField id="catering-message" label="Additional Details (optional)" error={errors.message?.message}>
        <textarea id="catering-message" {...register('message')} className={cn(inputClass, 'min-h-[100px] resize-y')} />
      </FormField>
      <Button type="submit" variant="gold" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Submitting…' : 'Submit Enquiry'}
      </Button>
    </form>
  );
}
