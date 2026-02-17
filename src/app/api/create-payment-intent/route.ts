import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICING_TIERS, CURRENCY, isTestMode } from '@/lib/stripe';

type PricingTier = 'free' | 'pro' | 'team';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, userId } = body as { tier?: string; userId?: string };

    // Validate tier
    // @ts-ignore
    const validTiers: PricingTier[] = ['free', 'pro', 'team'];
    // @ts-ignore
    if (!tier || !validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Ungültiger Pricing Tier' },
        { status: 400 }
      );
    }

    // @ts-ignore
    const tierInfo = PRICING_TIERS[tier];

    // Free tier doesn't need payment
    if (tierInfo.price === 0) {
      return NextResponse.json({
        message: 'Free Tier - keine Zahlung erforderlich',
        clientSecret: null,
        tier,
      });
    }

    // Check if Stripe is configured
    if (isTestMode) {
      console.log('🧪 Test-Modus: Payment Intent würde erstellt werden');
      return NextResponse.json({
        message: 'Test-Modus aktiv - kein echter Payment Intent',
        mock: true,
        tier,
        amount: tierInfo.price,
        currency: CURRENCY,
      });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: tierInfo.price,
      currency: CURRENCY,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        tier,
        userId: userId || 'anonymous',
        product: 'paymodel-ai-subscription',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      tier,
      amount: tierInfo.price,
      currency: CURRENCY,
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Payment Intents' },
      { status: 500 }
    );
  }
}
