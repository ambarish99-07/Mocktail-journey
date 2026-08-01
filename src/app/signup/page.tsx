import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-xl2 border border-tbc-charcoal-border bg-tbc-charcoal-light p-8">
        <h1 className="mb-6 text-center text-2xl font-semibold">Create Account</h1>
        <SignupForm />
      </div>
    </Container>
  );
}
