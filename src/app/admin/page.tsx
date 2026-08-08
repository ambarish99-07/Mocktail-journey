import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { AdminOrdersTable } from '@/components/admin/AdminOrdersTable';
import { NewOrderAlertSystem } from '@/components/admin/NewOrderAlertSystem';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: 'Admin — Orders',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-semibold sm:text-4xl">Orders</h1>
      <p className="mt-1 text-tbc-cream-muted">Incoming orders across the website, refreshed automatically.</p>
      <AdminNav />
      <div>
        <NewOrderAlertSystem />
        <AdminOrdersTable />
      </div>
    </Container>
  );
}
