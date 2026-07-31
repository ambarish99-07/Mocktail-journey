export type MenuCategory = 'signature-shakes' | 'cold-coffee';

export type FlavorBadge =
  | 'Chocolate Lover'
  | 'Fruity'
  | 'Classic'
  | 'Nutty'
  | 'Coffee Favorite';

export interface AddOnOption {
  id: string;
  label: string;
  price: number;
}

export const SUGAR_LEVELS = ['No Sugar', 'Less Sugar', 'Regular', 'Extra Sweet'] as const;
export type SugarLevel = (typeof SUGAR_LEVELS)[number];

export const ICE_LEVELS = ['No Ice', 'Less Ice', 'Regular', 'Extra Ice'] as const;
export type IceLevel = (typeof ICE_LEVELS)[number];

export interface MenuItem {
  id: string;
  signatureName: string;
  commonName: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  flavorBadges: FlavorBadge[];
  isPopular?: boolean;
  isNew?: boolean;
  isStaffPick?: boolean;
  /** IDs of other menu items this pairs well with — powers "Frequently Bought Together". */
  pairsWith?: string[];
}

export const ADD_ON_OPTIONS: AddOnOption[] = [
  { id: 'whipped-cream', label: 'Whipped Cream', price: 30 },
  { id: 'extra-chocolate-syrup', label: 'Extra Chocolate Syrup', price: 25 },
  { id: 'oreo-crumbs', label: 'Oreo Crumbs', price: 35 },
  { id: 'kitkat-crumbs', label: 'KitKat Crumbs', price: 40 },
  { id: 'dry-fruits', label: 'Dry Fruits', price: 45 },
];
