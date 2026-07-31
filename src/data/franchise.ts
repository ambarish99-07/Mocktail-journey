export interface FranchiseModel {
  id: string;
  name: string;
  format: string;
  investmentRange: string;
  areaRequired: string;
}

export interface RoadmapStep {
  step: string;
  title: string;
  description: string;
}

/** Placeholder figures — replace with finalized FDD/investment figures before publishing. */
export const franchiseModels: FranchiseModel[] = [
  {
    id: 'kiosk',
    name: 'Kiosk',
    format: 'Compact high-footfall kiosk (malls, food courts)',
    investmentRange: '₹8L – ₹12L',
    areaRequired: '100 – 150 sq. ft.',
  },
  {
    id: 'standard-store',
    name: 'Standard Store',
    format: 'Full-format café-style outlet with seating',
    investmentRange: '₹18L – ₹28L',
    areaRequired: '300 – 500 sq. ft.',
  },
  {
    id: 'flagship',
    name: 'Flagship Store',
    format: 'Premium flagship location with extended menu & lounge seating',
    investmentRange: '₹35L+',
    areaRequired: '700+ sq. ft.',
  },
];

export const franchiseBenefits = [
  'Established, growing premium brand',
  'Proven recipes and standardized operations manual',
  'Marketing & brand launch support',
  'Staff training and onboarding program',
  'Ongoing operational and supply chain support',
  'Territory protection within your radius',
];

export const franchiseRoadmap: RoadmapStep[] = [
  { step: '01', title: 'Application', description: 'Submit your franchise application with location and investment details.' },
  { step: '02', title: 'Discovery Call', description: 'Our team reviews your application and schedules an introductory call.' },
  { step: '03', title: 'Site Evaluation', description: 'We evaluate your proposed location against our brand and footfall criteria.' },
  { step: '04', title: 'Agreement', description: 'Finalize the franchise agreement and investment plan.' },
  { step: '05', title: 'Setup & Training', description: 'Store buildout, staff training, and pre-launch marketing support.' },
  { step: '06', title: 'Grand Opening', description: 'Launch with full operational and marketing support from our team.' },
];

export const investmentBudgetOptions = ['Under ₹10L', '₹10L – ₹20L', '₹20L – ₹35L', '₹35L+'];
