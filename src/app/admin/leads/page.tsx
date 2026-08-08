import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { AdminLeadsTable } from '@/components/admin/AdminLeadsTable';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: 'Admin — Enquiries',
  robots: { index: false, follow: false },
};

export default function AdminLeadsPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Enquiries</h1>
      <p className="mt-1 text-tbc-cream-muted">
        Contact messages, catering enquiries, and franchise applications submitted through the website.
      </p>
      <AdminNav />
      <div>
        <AdminLeadsTable />
      </div>
    </Container>
  );
}
