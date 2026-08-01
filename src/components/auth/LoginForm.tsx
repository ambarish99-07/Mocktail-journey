'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { FormField, inputClass } from '@/components/ui/FormField';
import { useAuthStore } from '@/lib/store/auth-store';
import { loginSchema, type LoginFormValues } from '@/lib/validation';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setServerError(body.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setUser(body.user);
      toast.success(`Welcome back, ${body.user.fullName.split(' ')[0]}!`);
      router.push(searchParams.get('redirect') || '/account');
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField id="login-email" label="Email" error={errors.email?.message}>
        <input id="login-email" type="email" {...register('email')} className={inputClass} autoComplete="email" />
      </FormField>
      <FormField id="login-password" label="Password" error={errors.password?.message}>
        <input
          id="login-password"
          type="password"
          {...register('password')}
          className={inputClass}
          autoComplete="current-password"
        />
      </FormField>

      {serverError && (
        <p role="alert" className="text-sm text-red-400">
          {serverError}
        </p>
      )}

      <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing In…' : 'Sign In'}
      </Button>

      <p className="text-center text-sm text-tbc-cream-muted">
        New here?{' '}
        <Link href="/signup" className="text-tbc-gold-400 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
