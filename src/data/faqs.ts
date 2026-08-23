export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: 'ordering' | 'menu' | 'rewards' | 'catering' | 'franchise' | 'general';
}

export const faqs: Faq[] = [
  {
    id: 'f1',
    question: 'Why should I order directly from the website?',
    answer:
      'Direct website orders automatically receive a discount with no coupon required, earn Blenders Club Rewards points, and let you fully customize sugar level, ice level, and add-ons.',
    category: 'ordering',
  },
  {
    id: 'f3',
    question: 'Can I customize my shake?',
    answer:
      'Yes — every drink can be customized with sugar level, ice level, and premium add-ons like whipped cream, extra chocolate syrup, Oreo crumbs, KitKat crumbs, or dry fruits.',
    category: 'menu',
  },
  {
    id: 'f4',
    question: 'How does The Blenders Club Rewards program work?',
    answer:
      'Your first website order gets 10% off, returning customers get 15% off, and Gold Members get 20% off. Rewards are tracked automatically and will carry over to full customer accounts soon.',
    category: 'rewards',
  },
  {
    id: 'f5',
    question: 'Is there a store I can walk into, or is it delivery only?',
    answer:
      'The Blenders Club is a delivery-only cloud kitchen — we don’t have walk-in or dine-in seating. Every order is freshly blended and delivered to your door; delivery fees and estimated times are shown before you confirm your order.',
    category: 'ordering',
  },
  {
    id: 'f6',
    question: 'Can I order for a party or event?',
    answer:
      'Absolutely. Visit our Catering page to see packages for birthdays, weddings, corporate events, and more, or submit an enquiry directly.',
    category: 'catering',
  },
  {
    id: 'f7',
    question: 'How do I apply for a Blenders Club franchise?',
    answer:
      'Visit our Franchise page to review investment models and submit an application. Our team will reach out with next steps.',
    category: 'franchise',
  },
  {
    id: 'f8',
    question: 'How do I share my delivery location on WhatsApp orders?',
    answer:
      'Tap "Share Delivery Location" during WhatsApp checkout — with your permission, we generate a precise Google Maps link automatically. You can also paste a Maps link manually if you prefer.',
    category: 'ordering',
  },
];
