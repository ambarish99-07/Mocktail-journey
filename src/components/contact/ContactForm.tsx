'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactFormValues } from '@/lib/validation';
import { FormField, inputClass } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormValues) => {
    // TODO: replace with a real backend/email endpoint once available.
    // eslint-disable-next-line no-console
    console.log('Contact form submission (placeholder):', data);
    await new Promise((r) => setTimeout(r, 400));
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="rounded-xl2 border border-tbc-emerald-700/50 bg-tbc-emerald-900/30 p-6 text-sm text-tbc-emerald-200">
        Thanks for reaching out! Our team will get back to you shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="contact-name" label="Name" error={errors.name?.message}>
          <input id="contact-name" {...register('name')} className={inputClass} autoComplete="name" />
        </FormField>
        <FormField id="contact-phone" label="Phone" error={errors.phone?.message}>
          <input id="contact-phone" {...register('phone')} className={inputClass} autoComplete="tel" />
        </FormField>
      </div>
      <FormField id="contact-email" label="Email" error={errors.email?.message}>
        <input id="contact-email" {...register('email')} type="email" className={inputClass} autoComplete="email" />
      </FormField>
      <FormField id="contact-message" label="Message" error={errors.message?.message}>
        <textarea id="contact-message" {...register('message')} className={cn(inputClass, 'min-h-[120px] resize-y')} />
      </FormField>
      <Button type="submit" variant="gold" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  );
}
