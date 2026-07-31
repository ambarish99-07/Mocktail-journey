import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { FeaturedDrinks } from '@/components/home/FeaturedDrinks';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { SignatureMenuPreview } from '@/components/home/SignatureMenuPreview';
import { ComboOffers } from '@/components/home/ComboOffers';
import { DirectOrderingBenefits } from '@/components/home/DirectOrderingBenefits';
import { Testimonials } from '@/components/home/Testimonials';
import { CateringTeaser } from '@/components/home/CateringTeaser';
import { FranchiseTeaser } from '@/components/home/FranchiseTeaser';
import { InstagramGallery } from '@/components/home/InstagramGallery';
import { FAQPreview } from '@/components/home/FAQPreview';

export const metadata: Metadata = {
  title: 'Premium Shakes & Cold Coffee, Crafted Fresh',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedDrinks />
      <WhyChooseUs />
      <SignatureMenuPreview />
      <ComboOffers />
      <DirectOrderingBenefits />
      <Testimonials />
      <CateringTeaser />
      <FranchiseTeaser />
      <InstagramGallery />
      <FAQPreview />
    </>
  );
}
