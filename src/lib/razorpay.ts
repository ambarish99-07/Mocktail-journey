import crypto from 'node:crypto';
import Razorpay from 'razorpay';

let instance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!instance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set — add them to .env.local.');
    }
    instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return instance;
}

/** Issues a real refund against a captured payment — used for automatic pre-delivery cancellations and approved post-delivery Razorpay refund claims. Returns the refund ID, or null if the call fails (caller decides how to handle — never silently claim success). */
export async function refundPayment(razorpayPaymentId: string, amountRupees: number): Promise<string | null> {
  if (amountRupees <= 0) return null;
  try {
    const refund = await getRazorpayClient().payments.refund(razorpayPaymentId, {
      amount: Math.round(amountRupees * 100), // paise
    });
    return refund.id;
  } catch (err) {
    console.error('[razorpay] refund failed', err);
    return null;
  }
}

/**
 * The client's payment-success callback is never trusted alone — this signature
 * check (HMAC-SHA256 over "orderId|paymentId" using the account's key secret) is
 * the only thing that marks an order paid. Constant-time comparison to avoid
 * timing attacks on the signature check itself.
 */
export function verifyRazorpaySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not set — add it to .env.local.');
  }
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const expectedBuffer = Buffer.from(expected, 'utf8');
  const actualBuffer = Buffer.from(signature, 'utf8');
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}
