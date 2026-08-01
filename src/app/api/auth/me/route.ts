import { NextResponse } from 'next/server';
import { getCurrentUser, toSafeUser } from '@/lib/auth/server';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  return NextResponse.json({ user: toSafeUser(user) });
}
