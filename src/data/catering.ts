export interface CateringPackage {
  id: string;
  name: string;
  description: string;
  startingPrice: string;
  bestFor: string;
  inclusions: string[];
}

export const cateringOccasions = [
  'Birthday Parties',
  'Weddings',
  'Corporate Events',
  'School & College Events',
  'House Parties',
  'Festivals',
  'Exhibitions',
  'Sports Events',
  'Engagements',
  'Anniversaries',
];

/** Placeholder pricing — replace with final catering rate card before launch. */
export const cateringPackages: CateringPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'A compact shake bar setup, perfect for smaller gatherings.',
    startingPrice: 'From ₹99 / guest',
    bestFor: 'Up to 30 guests',
    inclusions: ['3 signature shake flavours', 'Standard cups & straws', '2-hour service window'],
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Our most popular catering package with a fuller flavour lineup.',
    startingPrice: 'From ₹129 / guest',
    bestFor: 'Up to 75 guests',
    inclusions: ['5 signature shakes + cold coffee', 'Branded cups', 'On-site blending station', '3-hour service window'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'A full Blenders Club experience with live customization for guests.',
    startingPrice: 'From ₹169 / guest',
    bestFor: '75+ guests',
    inclusions: [
      'Full menu access + live add-ons bar',
      'Dedicated staff & branded setup',
      'Custom flavour for the occasion',
      '4-hour service window',
    ],
  },
];
