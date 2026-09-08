import { NextResponse } from 'next/server';
import { getStoreStatus } from '@/lib/store-status';

// Depends on the current time, not any request input — without this, Next
// treats it as static (no dynamic data source) and bakes in the build-time
// result forever instead of checking on every request.
export const dynamic = 'force-dynamic';

/** Public, no auth — powers the client-side StoreClosedBanner. The authoritative check still happens server-side in POST /api/orders. */
export async function GET() {
  return NextResponse.json(getStoreStatus());
}
