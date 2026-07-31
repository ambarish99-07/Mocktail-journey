export interface FixedCombo {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  comboPrice: number;
  image: string;
}

export interface ChooseNCombo {
  id: string;
  name: string;
  description: string;
  chooseCount: number;
  comboPrice: number;
  /** Eligible category — null means any menu item qualifies. */
  eligibleCategory: 'signature-shakes' | 'cold-coffee' | null;
}

/** Curated fixed-item combos. Prices are pre-set bundle prices (website discount still applies at checkout). */
export const fixedCombos: FixedCombo[] = [
  {
    id: 'chocolate-duo',
    name: 'Chocolate Duo',
    description: 'Choco Crush + Choco Crunch Blast — double the chocolate indulgence.',
    itemIds: ['choco-crush', 'choco-crunch-blast'],
    comboPrice: 399,
    image: 'https://images.unsplash.com/photo-1653085315536-1379bc836161?w=800&q=80',
  },
  {
    id: 'crunch-lovers',
    name: 'Crunch Lovers',
    description: 'Wafer Wonder + Golden Crunch — for those who love texture in every sip.',
    itemIds: ['wafer-wonder', 'golden-crunch'],
    comboPrice: 419,
    image: 'https://images.unsplash.com/photo-1555411093-41f7864ed3a2?w=800&q=80',
  },
  {
    id: 'coffee-combo',
    name: 'Coffee Combo',
    description: 'Coffee Chill + Mocha Magic — a chilled coffee duo to share or savour solo.',
    itemIds: ['coffee-chill', 'mocha-magic'],
    comboPrice: 369,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
  },
  {
    id: 'fruit-delight',
    name: 'Fruit Delight',
    description: 'Mango Magic + Berry Bloom — fresh, fruity and refreshingly light.',
    itemIds: ['mango-magic', 'berry-bloom'],
    comboPrice: 379,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&q=80',
  },
  {
    id: 'premium-duo',
    name: 'Premium Duo',
    description: 'Saffron Gold + Hazelnut Heaven — our most indulgent pairing.',
    itemIds: ['saffron-gold', 'hazelnut-heaven'],
    comboPrice: 449,
    image: 'https://images.unsplash.com/photo-1696487773677-c0c8061fe3d2?w=800&q=80',
  },
];

/** "Build your own" combos — the customer picks N drinks from the menu at a bundled price. */
export const chooseNCombos: ChooseNCombo[] = [
  {
    id: 'choose-any-two',
    name: 'Choose Any Two',
    description: 'Pick any 2 drinks from the full menu at a special bundle price.',
    chooseCount: 2,
    comboPrice: 379,
    eligibleCategory: null,
  },
  {
    id: 'choose-any-four',
    name: 'Choose Any Four',
    description: 'Pick any 4 drinks — perfect for sharing with friends.',
    chooseCount: 4,
    comboPrice: 729,
    eligibleCategory: null,
  },
  {
    id: 'choose-any-six',
    name: 'Choose Any Six',
    description: 'Pick any 6 drinks — ideal for small gatherings and parties.',
    chooseCount: 6,
    comboPrice: 1049,
    eligibleCategory: null,
  },
];
