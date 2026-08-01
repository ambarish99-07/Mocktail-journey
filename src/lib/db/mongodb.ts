import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'blenders_club';

/**
 * Never import this module from middleware.ts or a client component — the
 * Edge runtime has no Node TCP sockets. Session verification in middleware
 * uses only jose against the JWT payload, no DB call.
 */

let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MONGODB_URI is not set — add it to .env.local (see .env.example).');
  }
  const client = new MongoClient(uri);
  return client.connect();
}

/**
 * Cached-connection pattern: in dev, cache on globalThis so Next.js Fast
 * Refresh doesn't spawn a new connection pool on every module re-evaluation.
 * In production, a module-scoped memoized promise is enough since each
 * serverless instance is short-lived and reuses it across warm invocations.
 */
function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = createClientPromise();
  }
  return clientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(dbName);
}
