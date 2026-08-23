export interface Testimonial {
  id: string;
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  location?: string;
}

/**
 * Placeholder testimonials. Reserve this slot for a future Google Reviews
 * integration (see components/home/Testimonials.tsx for the swap-in point).
 */
export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Ananya R.',
    rating: 5,
    quote:
      'The Choco Crush is unreal — thick, rich, and clearly made with real ingredients. Ordering directly from their site got me a discount too.',
    location: 'Indiranagar',
  },
  {
    id: 't2',
    name: 'Rahul M.',
    rating: 5,
    quote:
      'Saffron Gold tastes genuinely premium. The website ordering was faster than the apps and I could customize sugar and ice level exactly how I like it.',
    location: 'HSR Layout',
  },
  {
    id: 't3',
    name: 'Priya S.',
    rating: 5,
    quote:
      'Booked them for my daughter\'s birthday party catering — the shake station was the highlight of the event. Impeccable service.',
    location: 'Koramangala',
  },
  {
    id: 't4',
    name: 'Vikram K.',
    rating: 4,
    quote: 'Coffee Chill is my daily fix. Consistent quality every single time, and the loyalty rewards keep me coming back.',
    location: 'Whitefield',
  },
];
