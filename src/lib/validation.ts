import { z } from 'zod';

/** The Blenders Club is delivery-only (cloud kitchen, no dine-in/pickup) — delivery details are always required. */
export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9]{10,13}$/, 'Enter a valid phone number'),
  address: z.string().trim().min(5, 'Enter your delivery address'),
  city: z.string().trim().min(2, 'Enter your city'),
  pincode: z.string().trim().regex(/^[0-9]{6}$/, 'Enter a valid 6-digit pincode'),
  mapsLink: z.string().trim().url('Enter a valid Google Maps link').optional().or(z.literal('')),
  specialInstructions: z.string().trim().max(300).optional().or(z.literal('')),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9]{10,13}$/, 'Enter a valid phone number'),
  message: z.string().trim().min(10, 'Tell us a bit more (min. 10 characters)'),
});
export type ContactFormValues = z.infer<typeof contactSchema>;

export const cateringEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9]{10,13}$/, 'Enter a valid phone number'),
  eventType: z.string().trim().min(2, 'Select or enter an event type'),
  eventDate: z.string().trim().min(1, 'Select an approximate event date'),
  guestCount: z.coerce.number({ invalid_type_error: 'Enter expected number of guests' }).min(1, 'Enter expected number of guests'),
  message: z.string().trim().optional().or(z.literal('')),
});
export type CateringEnquiryFormValues = z.infer<typeof cateringEnquirySchema>;

export const franchiseApplicationSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9]{10,13}$/, 'Enter a valid phone number'),
  city: z.string().trim().min(2, 'Enter your preferred city'),
  investmentBudget: z.string().trim().min(1, 'Select an investment range'),
  experience: z.string().trim().optional().or(z.literal('')),
  message: z.string().trim().optional().or(z.literal('')),
});
export type FranchiseApplicationFormValues = z.infer<typeof franchiseApplicationSchema>;
