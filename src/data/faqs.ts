export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: 'ordering' | 'menu' | 'rewards' | 'catering' | 'franchise' | 'general';
}

export const faqs: Faq[] = [
  // Ordering
  {
    id: 'f1',
    question: 'Why should I order directly from the website?',
    answer:
      'Direct website orders automatically receive the best available discount with no coupon required, count toward your Blenders Club Rewards (multi-shake discounts, milestone rewards, and Premium Membership), and let you fully customize sugar level, ice level, and add-ons. You can also order through WhatsApp, but rewards and account-based perks are tracked for website orders.',
    category: 'ordering',
  },
  {
    id: 'f5',
    question: 'Is there a store I can walk into, or is it delivery only?',
    answer:
      'The Blenders Club is a delivery-only cloud kitchen — we don’t have walk-in or dine-in seating. Every order is freshly blended and delivered to your door; delivery fees and an estimated delivery time (based on your distance from our kitchen) are shown before you confirm your order.',
    category: 'ordering',
  },
  {
    id: 'f9',
    question: 'What payment methods can I use, and is online payment safe?',
    answer:
      'You can pay online via Razorpay (cards, UPI, netbanking, wallets) or choose Cash on Delivery. Razorpay is a PCI-DSS-compliant payment processor — your card, UPI, and bank details go directly to Razorpay and are never stored on our servers. Every online payment is independently verified on our end before your order is confirmed.',
    category: 'ordering',
  },
  {
    id: 'f10',
    question: 'Can I track my order after placing it?',
    answer:
      'Yes — your order confirmation page shows a live status tracker (Received, Preparing, Out for Delivery, Delivered), and once your order is out for delivery you’ll see your rider’s live location on a map along with their name and buttons to call or text them directly.',
    category: 'ordering',
  },
  {
    id: 'f11',
    question: 'Can I cancel my order, and will I get a refund?',
    answer:
      'Yes. Cancel anytime from your order confirmation page: cancelling before your order is out for delivery gets a full refund, and cancelling once it’s out for delivery gets a half refund. If your order has already been delivered, you can submit a refund request for genuine issues (spilled, wrong item, missing item) for our team to review — approved claims get a full refund. For Cash on Delivery orders where cash hasn’t been collected yet, there’s nothing to refund; for a genuine issue approved after a COD payment, we issue a ₹100 coupon valid for 60 days on your next order instead of a cash refund.',
    category: 'ordering',
  },
  {
    id: 'f18',
    question: 'I paid online — how long until I see my refund?',
    answer:
      'For orders paid via Razorpay, a cancellation or an approved refund request triggers the refund to your original payment method immediately on our end. From there it typically takes 5–7 business days to reflect in your bank, card, or UPI statement, depending on your bank — this final step is outside our control. See our Refund & Cancellation Policy for full details.',
    category: 'ordering',
  },
  {
    id: 'f8',
    question: 'How do I share my exact delivery location?',
    answer:
      'On the checkout page (and when ordering via WhatsApp), tap "Share Delivery Location" — with your permission, we generate a precise Google Maps link automatically. You can also paste a Maps link manually if you prefer, which helps us estimate delivery time accurately and confirm your address.',
    category: 'ordering',
  },
  {
    id: 'f12',
    question: 'Do I need an account to order?',
    answer:
      'No — guest checkout is fully supported and still gets the multi-shake discount. Creating a free account additionally unlocks Buy 1 Get 1 Free on your first order, milestone rewards every 6th and 10th order, order history, saved delivery details, and eligibility for Premium Membership after 15 completed orders.',
    category: 'ordering',
  },

  // Menu
  {
    id: 'f3',
    question: 'Can I customize my shake?',
    answer:
      'Yes — every drink can be customized with sugar level, ice level, and premium add-ons like whipped cream, extra chocolate syrup, Oreo crumbs, KitKat crumbs, or dry fruits.',
    category: 'menu',
  },

  // Rewards
  {
    id: 'f4',
    question: 'How does The Blenders Club Rewards program work?',
    answer:
      'Rewards are automatic and stack: every order gets a Multi-Shake Discount based on how many drinks are in your cart (10% off 2+, 15% off 3+, 20% off 4+), combo bundles always get a flat 15% off, and registered accounts also get Buy 1 Get 1 Free on their first order plus repeating milestone rewards — 50% off a cold coffee every 6th order and a free drink every 10th order. No coupon codes needed for any of these.',
    category: 'rewards',
  },
  {
    id: 'f13',
    question: 'What is Premium Membership and how do I unlock it?',
    answer:
      'Premium Membership is our top loyalty tier: 25% off every order (in place of the Multi-Shake Discount) plus free delivery within 3km of our kitchen. It unlocks automatically once you’ve completed 15 orders on a registered account — after that, you can join anytime from your Account page.',
    category: 'rewards',
  },
  {
    id: 'f14',
    question: 'Can I get free delivery without waiting for 15 orders?',
    answer:
      'Yes — the Premium Membership Card is a paid shortcut to free delivery: ₹21 for 60 days of free-delivery eligibility within 3km of our kitchen, with no order-count requirement. It doesn’t include the 25% Premium order discount, only free delivery. Purchase it anytime from your Account page; you’ll get a reminder to renew starting 2 days before it expires.',
    category: 'rewards',
  },
  {
    id: 'f15',
    question: 'What happens to my delivery time and fee if I live farther away?',
    answer:
      'Delivery is free on orders over ₹499, and for Premium Members or active Premium Card holders on any order within 3km of our kitchen — otherwise a flat ₹39 delivery fee applies. Estimated delivery time scales with your distance from the kitchen rather than quoting the same time to everyone, so addresses farther away will see a longer (but more accurate) estimate at checkout.',
    category: 'rewards',
  },
  {
    id: 'f16',
    question: 'How do the milestone and first-order rewards work exactly?',
    answer:
      'On a registered account, your very first order gets Buy 1 Get 1 Free automatically once you add 2 or more eligible drinks (combos don’t count). After that, two independent counters run in the background: every 6th completed order gets 50% off your cheapest cold coffee, and every 10th completed order includes one drink completely free. Both keep repeating for as long as you keep ordering.',
    category: 'rewards',
  },

  // Catering
  {
    id: 'f6',
    question: 'Can I order for a party or event?',
    answer:
      'Absolutely. Visit our Catering page to see packages for birthdays, weddings, corporate events, and more, or submit an enquiry directly with your event date, guest count, and occasion — our team will get back to you with a custom quote.',
    category: 'catering',
  },

  // Franchise
  {
    id: 'f7',
    question: 'How do I apply for a Blenders Club franchise?',
    answer:
      'Visit our Franchise page to review the available kitchen formats and investment ranges, then submit an application with your preferred location and budget. Our team will reach out to schedule a discovery call and walk you through site evaluation, agreement, setup, and launch.',
    category: 'franchise',
  },

  // General
  {
    id: 'f17',
    question: 'I have a question that isn’t answered here — how do I reach you?',
    answer:
      'Use the Contact page to send us a message, or reach us directly by phone, WhatsApp, or email — our contact details are in the footer of every page. We typically respond within 24 hours.',
    category: 'general',
  },
];
