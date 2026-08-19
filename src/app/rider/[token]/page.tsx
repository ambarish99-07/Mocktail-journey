import type { Metadata } from 'next';
import { RiderTrackingClient } from '@/components/rider/RiderTrackingClient';

export const metadata: Metadata = {
  title: 'Delivery Tracking',
  robots: { index: false, follow: false },
};

export default function RiderTrackingPage({ params }: { params: { token: string } }) {
  return <RiderTrackingClient token={params.token} />;
}
