import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.metadata?.email || session.customer_details?.email;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const planName = session.metadata?.planName || 'pro';

        // Create or update profile
        if (email) {
          // Get user from email (simplified - in production, you'd use auth)
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

          if (profiles) {
            await supabase
              .from('profiles')
              .update({
                stripe_customer_id: customerId,
                subscription_id: subscriptionId,
                subscription_plan: planName,
                subscription_status: 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('id', profiles.id);
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find profile by Stripe customer ID
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profiles) {
          const status = subscription.status === 'active' ? 'active' : 'inactive';
          await supabase
            .from('profiles')
            .update({
              subscription_status: status,
              subscription_plan: subscription.metadata?.planName || 'pro',
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', profiles.id);

          // Add to history
          await supabase.from('subscription_history').insert({
            user_id: profiles.id,
            stripe_subscription_id: subscription.id,
            plan: subscription.metadata?.planName || 'pro',
            status,
            amount: subscription.items.data[0]?.price.unit_amount || 0,
            period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profiles) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('id', profiles.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
