import Stripe from 'stripe';
export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
export function getStripe() { return isStripeConfigured ? new Stripe(process.env.STRIPE_SECRET_KEY!) : null; }
export async function createCheckoutPlaceholder(plan:string) { return { url: isStripeConfigured ? `/api/billing/checkout?plan=${plan}` : `/dashboard/settings?checkout=demo&plan=${plan}` }; }
