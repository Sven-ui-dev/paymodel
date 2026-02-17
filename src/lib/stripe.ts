import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ Stripe Secret Key nicht konfiguriert - Test-Modus aktiv');
}

// Initialize Stripe in TEST-Modus
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia' as any,
  typescript: true,
});

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

export const isTestMode = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('PLACEHOLDER');

// Pricing constants (in cents)
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: ['5 Credits/Monat', 'Basic Support', 'Standard Processing'],
  },
  pro: {
    name: 'Pro',
    price: 900, // 9.00 EUR
    priceId: 'price_pro_monthly',
    features: ['100 Credits/Monat', 'Priority Support', 'Schnellere Verarbeitung', 'Erweiterte Analytics'],
  },
  team: {
    name: 'Team',
    price: 2900, // 29.00 EUR
    priceId: 'price_team_monthly',
    features: ['500 Credits/Monat', 'Dedizierter Support', 'Maximale Verarbeitung', 'Team-Funktionen', 'API Access'],
  },
};

export const CURRENCY = 'eur';
