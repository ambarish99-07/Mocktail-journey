import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Container } from '@/components/ui/Container';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-8">
        <h1 className="mb-6 text-center text-2xl font-semibold">Sign In</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </Container>
  );
}
