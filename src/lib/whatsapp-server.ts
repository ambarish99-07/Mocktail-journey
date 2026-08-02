import type { OrderDoc, OrderStatusEvent } from '@/types/db';
import type { MenuItem } from '@/types/menu';
import { formatCurrency } from '@/lib/utils';

/**
 * Server-initiated WhatsApp messages via the Cloud API (Meta Business Platform) —
 * distinct from src/lib/whatsapp.ts, which builds user-initiated wa.me deep links
 * and stays completely independent (the "Send Order via WhatsApp Instead" button).
 *
 * Message templates must be pre-approved in Meta Business Manager before they can
 * be sent here — template names are read from env, not hardcoded, since they don't
 * exist yet. Until WHATSAPP_PHONE_NUMBER_ID/WHATSAPP_ACCESS_TOKEN are configured,
 * every call here silently no-ops (logs only) — this must NEVER throw or block
 * order creation / status updates.
 */

interface SendTemplateArgs {
  to: string;
  templateName: string | undefined;
  bodyParams?: string[];
}

interface SendResult {
  ok: boolean;
  error?: string;
}

async function sendWhatsAppTemplateMessage({ to, templateName, bodyParams = [] }: SendTemplateArgs): Promise<SendResult> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE_CODE || 'en';

  if (!phoneNumberId || !accessToken || !templateName) {
    console.warn('[whatsapp] not configured, skipping message', { to, templateName });
    return { ok: false, error: 'not-configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components: bodyParams.length
            ? [{ type: 'body', parameters: bodyParams.map((text) => ({ type: 'text', text })) }]
            : undefined,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      console.error('[whatsapp] send failed', res.status, errorBody);
      return { ok: false, error: `http-${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error('[whatsapp] send threw', err);
    return { ok: false, error: 'network-error' };
  } finally {
    clearTimeout(timeout);
  }
}

/** Fired when an order is confirmed (COD: immediately; Razorpay: after payment verification). Never throws. */
export async function notifyAdminNewOrder(order: OrderDoc): Promise<void> {
  const adminNumber = process.env.WHATSAPP_ADMIN_NUMBER;
  if (!adminNumber) {
    console.warn('[whatsapp] WHATSAPP_ADMIN_NUMBER not set, skipping admin alert for', order.orderNumber);
    return;
  }
  await sendWhatsAppTemplateMessage({
    to: adminNumber,
    templateName: process.env.WHATSAPP_TEMPLATE_ADMIN_NEW_ORDER,
    bodyParams: [order.orderNumber, formatCurrency(order.totals.total), order.delivery.fullName],
  });
}

/** Fired when the admin advances an order's status. Deduped by caller via order.whatsapp.customerNotifiedStatuses. Never throws. */
export async function notifyCustomerStatusUpdate(order: OrderDoc, event: OrderStatusEvent): Promise<void> {
  await sendWhatsAppTemplateMessage({
    to: order.delivery.phone,
    templateName: process.env.WHATSAPP_TEMPLATE_CUSTOMER_STATUS_UPDATE,
    bodyParams: [order.orderNumber, event.status],
  });
}

/**
 * Admin-triggered (for now) product recommendation, based on the customer's own
 * purchase history — see src/lib/recommendations.ts for the selection logic.
 * Structured as a plain reusable call so a future scheduled job can fire the
 * same function without going through the admin route. Unlike the fire-and-forget
 * notifications above, this returns its result so the admin UI can show whether
 * the send actually succeeded.
 */
export async function sendRecommendationMessage(phone: string, customerName: string, items: MenuItem[]): Promise<SendResult> {
  const itemNames = items.map((item) => item.signatureName);
  return sendWhatsAppTemplateMessage({
    to: phone,
    templateName: process.env.WHATSAPP_TEMPLATE_RECOMMENDATION,
    bodyParams: [customerName, ...itemNames],
  });
}
