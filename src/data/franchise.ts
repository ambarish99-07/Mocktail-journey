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

/**
 * The Blenders Club is a delivery-only cloud kitchen — every format below is
 * a production kitchen sized for delivery order volume, not a walk-in
 * storefront. Placeholder figures — replace with finalized FDD/investment
 * figures before publishing.
 */
export const franchiseModels: FranchiseModel[] = [
  {
    id: 'micro-kitchen',
    name: 'Micro Kitchen',
    format: 'Compact delivery-only kitchen serving a focused local radius',
    investmentRange: '₹8L – ₹12L',
    areaRequired: '100 – 150 sq. ft.',
  },
  {
    id: 'cloud-kitchen-unit',
    name: 'Cloud Kitchen Unit',
    format: 'Standard production kitchen for a full-city delivery zone',
    investmentRange: '₹18L – ₹28L',
    areaRequired: '300 – 500 sq. ft.',
  },
  {
    id: 'multi-brand-hub',
    name: 'Multi-Brand Kitchen Hub',
    format: 'High-capacity kitchen supporting multiple delivery zones and peak-hour volume',
    investmentRange: '₹35L+',
    areaRequired: '700+ sq. ft.',
  },
];

export const franchiseBenefits = [
  'Established, growing premium brand',
  'Proven recipes and standardized operations manual',
  'Delivery-optimized kitchen layout and workflow design',
  'Marketing & brand launch support',
  'Staff training and onboarding program',
  'Ongoing operational and supply chain support',
  'Delivery zone protection within your radius',
];

export const franchiseRoadmap: RoadmapStep[] = [
  { step: '01', title: 'Application', description: 'Submit your franchise application with location and investment details.' },
  { step: '02', title: 'Discovery Call', description: 'Our team reviews your application and schedules an introductory call.' },
  { step: '03', title: 'Site Evaluation', description: 'We evaluate your proposed kitchen location against delivery-demand density and zone coverage.' },
  { step: '04', title: 'Agreement', description: 'Finalize the franchise agreement and investment plan.' },
  { step: '05', title: 'Setup & Training', description: 'Kitchen buildout, staff training, and pre-launch marketing support.' },
  { step: '06', title: 'Grand Opening', description: 'Launch with full operational and marketing support from our team.' },
];

export const investmentBudgetOptions = ['Under ₹10L', '₹10L – ₹20L', '₹20L – ₹35L', '₹35L+'];
