import type { OrderDoc, UserDoc } from '@/types/db';
import { getDb } from './mongodb';

let indexesEnsured: Promise<unknown> | null = null;

/** Runs once per server process (memoized), not once per request. */
function ensureIndexes(db: Awaited<ReturnType<typeof getDb>>) {
  if (!indexesEnsured) {
    indexesEnsured = Promise.all([
      db.collection<UserDoc>('users').createIndex({ email: 1 }, { unique: true }),
      db.collection<OrderDoc>('orders').createIndex({ orderNumber: 1 }, { unique: true }),
      db.collection<OrderDoc>('orders').createIndex({ userId: 1 }),
      db.collection<OrderDoc>('orders').createIndex({ status: 1 }),
      db.collection<OrderDoc>('orders').createIndex({ accessToken: 1 }, { sparse: true }),
    ]).catch((err) => {
      console.error('[db] index creation failed', err);
      indexesEnsured = null; // allow retry on next call rather than permanently swallowing the error
    });
  }
  return indexesEnsured;
}

export async function getUsersCollection() {
  const db = await getDb();
  await ensureIndexes(db);
  return db.collection<UserDoc>('users');
}

export async function getOrdersCollection() {
  const db = await getDb();
  await ensureIndexes(db);
  return db.collection<OrderDoc>('orders');
}
