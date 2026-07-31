import type { CartItem } from '@/types/cart';
import { orderingConfig } from '@/lib/config';
import { formatCurrency } from '@/lib/utils';
import { lineItemTotal } from '@/lib/pricing';
import { ADD_ON_OPTIONS } from '@/types/menu';

export interface WhatsAppOrderDetails {
  customerName: string;
  phone: string;
  address: string;
  mapsLink?: string;
  specialInstructions?: string;
  items: CartItem[];
  total: number;
}

function describeCustomization(item: CartItem): string {
  const addOnLabels = item.customization.addOnIds
    .map((id) => ADD_ON_OPTIONS.find((a) => a.id === id)?.label)
    .filter(Boolean);

  const parts = [
    `Sugar: ${item.customization.sugarLevel}`,
    `Ice: ${item.customization.iceLevel}`,
  ];
  if (addOnLabels.length) parts.push(`Add-ons: ${addOnLabels.join(', ')}`);
  return parts.join(' | ');
}

/** Builds a structured, human-readable order message for WhatsApp ordering. */
export function buildWhatsAppMessage(details: WhatsAppOrderDetails): string {
  const lines: string[] = [];
  lines.push('*New Order — The Blenders Club*');
  lines.push('');
  lines.push(`*Name:* ${details.customerName}`);
  lines.push(`*Phone:* ${details.phone}`);
  lines.push(`*Address:* ${details.address}`);
  if (details.mapsLink) lines.push(`*Location:* ${details.mapsLink}`);
  lines.push('');
  lines.push('*Order Items:*');
  details.items.forEach((item) => {
    lines.push(
      `• ${item.signatureName} (${item.commonName}) x${item.quantity} — ${formatCurrency(
        lineItemTotal(item)
      )}`
    );
    lines.push(`   ${describeCustomization(item)}`);
  });
  lines.push('');
  lines.push(`*Total:* ${formatCurrency(details.total)}`);
  if (details.specialInstructions) {
    lines.push('');
    lines.push(`*Special Instructions:* ${details.specialInstructions}`);
  }
  return lines.join('\n');
}

export function buildWhatsAppLink(message: string, phoneNumber = orderingConfig.whatsappNumber): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}

export interface GeolocationResult {
  mapsLink: string;
}

/**
 * Requests the browser's Geolocation API and resolves a Google Maps link.
 * Callers should catch the rejection and fall back to manual Maps-link entry
 * when permission is denied or the API is unavailable.
 */
export function shareCurrentLocation(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported on this device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ mapsLink: `https://maps.google.com/?q=${latitude},${longitude}` });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
