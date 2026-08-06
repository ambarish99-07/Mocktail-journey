export interface FixedCombo {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  comboPrice: number;
}

export interface BuildYourOwnCombo {
  id: string;
  name: string;
  description: string;
  chooseCount: number;
  comboPrice: number;
  /** Eligible category — null means any menu item qualifies. */
  eligibleCategory: 'signature-shakes' | 'cold-coffee' | null;
}

/** Curated two-shake combos. Prices are pre-set bundle prices (order-wide discounts still apply at checkout). */
export const fixedCombos: FixedCombo[] = [
  {
    id: 'chocolate-duo',
    name: 'Chocolate Duo',
    description: 'Choco Crush + Choco Crunch Blast — double the chocolate indulgence.',
    itemIds: ['choco-crush', 'choco-crunch-blast'],
    comboPrice: 399,
  },
  {
    id: 'crunch-lovers',
    name: 'Crunch Lovers',
    description: 'Wafer Wonder + Golden Crunch — for those who love texture in every sip.',
    itemIds: ['wafer-wonder', 'golden-crunch'],
    comboPrice: 419,
  },
  {
    id: 'coffee-combo',
    name: 'Coffee Combo',
    description: 'Coffee Chill + Mocha Magic — a chilled coffee duo to share or savour solo.',
    itemIds: ['coffee-chill', 'mocha-magic'],
    comboPrice: 369,
  },
  {
    id: 'fruit-delight',
    name: 'Fruit Delight',
    description: 'Mango Magic + Berry Bloom — fresh, fruity and refreshingly light.',
    itemIds: ['mango-magic', 'berry-bloom'],
    comboPrice: 379,
  },
  {
    id: 'premium-duo',
    name: 'Premium Duo',
    description: 'Saffron Gold + Hazelnut Heaven — our most indulgent pairing.',
    itemIds: ['saffron-gold', 'hazelnut-heaven'],
    comboPrice: 449,
  },
];

/** Single "build your own" option — pick any 2 drinks from the full menu at a flat bundle price. */
export const buildYourOwnCombo: BuildYourOwnCombo = {
  id: 'create-your-own',
  name: 'Create Your Own Combo',
  description: 'Pick any 2 drinks from the full menu at a special bundle price.',
  chooseCount: 2,
  comboPrice: 379,
  eligibleCategory: null,
};
