import type { IceLevel, SugarLevel } from './menu';

export interface CartCustomization {
  sugarLevel: SugarLevel;
  iceLevel: IceLevel;
  addOnIds: string[];
}

export interface CartItem {
  /** Unique per line — same drink with different customizations gets its own line. */
  lineId: string;
  menuItemId: string;
  signatureName: string;
  commonName: string;
  image: string;
  unitPrice: number;
  quantity: number;
  customization: CartCustomization;
}

export const DEFAULT_CUSTOMIZATION: CartCustomization = {
  sugarLevel: 'Regular',
  iceLevel: 'Regular',
  addOnIds: [],
};
