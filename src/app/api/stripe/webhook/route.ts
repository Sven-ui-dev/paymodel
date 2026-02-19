import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import {
  generateWelcomeEmailContent,
  generatePaymentConfirmationEmailContent,
  generatePaymentFailedEmailContent,
  generateSubscriptionRenewedEmailContent,
} from '@/components/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const resend = new Resend(process.env.RESEND_API_KEY!);

// Simple Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function sendWelcomeEmail(email: string, planName: string) {
  try {
    const { subject, html, text } = generateWelcomeEmailContent({
      firstName: undefined,
      planName: planName as 'pro' | 'business',
      loginUrl: `${appUrl}/dashboard`,
      supportUrl: 'mailto:support@paymodel.ai',
    });

    await resend.emails.send({
      from: 'paymodel.ai <waitlist@paymodel.ai>',
      to: [email],
      subject,
      html,
      text,
    });
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
  }
}

async function sendPaymentConfirmationEmail(
  email: string,
  amount: number,
  currency: string,
  planName: string,
  invoiceUrl: string,
  invoiceNumber: string
) {
  try {
    const { subject, html, text } = generatePaymentConfirmationEmailContent({
      firstName: undefined,
      amount,
      currency,
      planName,
      invoiceUrl,
      invoiceNumber,
      paymentDate: new Date().toLocaleDateString('de-DE'),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
    });

    await resend.emails.send({
      from: 'paymodel.ai <waitlist@paymodel.ai>',
      to: [email],
      subject,
      html,
      text,
    });
    console.log(`Payment confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send payment confirmation email to ${email}:`, error);
  }
}

async function sendPaymentFailedEmail(
  email: string,
  amount: number,
  currency: string,
  planName: string,
  nextBillingDate: string
) {
  try {
    const { subject, html, text } = generatePaymentFailedEmailContent({
      firstName: undefined,
      amount,
      currency,
      planName,
      nextBillingDate,
      dashboardUrl: `${appUrl}/dashboard`,
      supportUrl: 'mailto:support@paymodel.ai',
    });

    await resend.emails.send({
      from: 'paymodel.ai <waitlist@paymodel.ai>',
      to: [email],
      subject,
      html,
      text,
    });
    console.log(`Payment failed email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send payment failed email to ${email}:`, error);
  }
}

async function sendSubscriptionRenewedEmail(
  email: string,
  amount: number,
  currency: string,
  planName: string,
  currentPeriodEnd: string,
  nextBillingDate: string
) {
  try {
    const { subject, html, text } = generateSubscriptionRenewedEmailContent({
      firstName: undefined,
      amount,
      currency,
      planName,
      currentPeriodEnd,
      nextBillingDate,
      dashboardUrl: `${appUrl}/dashboard`,
    });

    await resend.emails.send({
      from: 'paymodel.ai <waitlist@paymodel.ai>',
      to: [email],
      subject,
      html,
      text,
    });
    console.log(`Subscription renewed email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send subscription renewed email to ${email}:`, error);
  }
}

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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.metadata?.email || session.customer_details?.email;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const planName = session.metadata?.planName || 'pro';

        if (email) {
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
            console.log(`Updated profile for ${email} to ${planName}`);

            // Send welcome and payment confirmation emails
            await sendWelcomeEmail(email, planName);
            
            // Try to get invoice details for payment confirmation
            try {
              if (subscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const latestInvoiceId = subscription.latest_invoice as string;
                if (latestInvoiceId) {
                  const invoice = await stripe.invoices.retrieve(latestInvoiceId);
                  await sendPaymentConfirmationEmail(
                    email,
                    invoice.amount_paid,
                    invoice.currency,
                    planName,
                    invoice.invoice_pdf || `${appUrl}/dashboard`,
                    invoice.number || 'INV-001'
                  );
                }
              }
            } catch (invoiceError) {
              console.error('Failed to send payment confirmation email:', invoiceError);
            }
          } else {
            console.log(`No profile found for email: ${email}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profiles) {
          const status = subscription.status === 'active' ? 'active' : 'inactive';
          const periodEnd = (subscription as any).current_period_end || subscription.billing_cycle_anchor;
          const previousAttributes = event.data.previous_attributes as any;
          
          await supabase
            .from('profiles')
            .update({
              subscription_status: status,
              subscription_plan: subscription.metadata?.planName || 'pro',
              current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profiles.id);

          const periodStart = (subscription as any).current_period_start || subscription.billing_cycle_anchor;
          await supabase.from('subscription_history').insert({
            user_id: profiles.id,
            stripe_subscription_id: subscription.id,
            plan: subscription.metadata?.planName || 'pro',
            status,
            amount: subscription.items.data[0]?.price.unit_amount || 0,
            period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
            period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          });
          console.log(`Updated subscription for customer ${customerId}`);

          // Send subscription renewed email if it was a renewal (status changed from past_due to active)
          if (event.type === 'customer.subscription.updated' && status === 'active') {
            const wasPastDue = previousAttributes?.status === 'past_due';
            if (!wasPastDue && profiles.email) {
              const amount = subscription.items.data[0]?.price.unit_amount || 0;
              const nextBillingDate = new Date(periodEnd * 1000).toLocaleDateString('de-DE');
              const currentPeriodEnd = new Date(periodEnd * 1000).toLocaleDateString('de-DE');
              
              await sendSubscriptionRenewedEmail(
                profiles.email,
                amount,
                subscription.currency || 'eur',
                subscription.metadata?.planName || 'pro',
                currentPeriodEnd,
                nextBillingDate
              );
            }
          }
        } else {
          console.log(`No profile found for customer: ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
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

          // Send payment failed email
          if (profiles.email) {
            const nextBillingDate = invoice.next_payment_attempt
              ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString('de-DE')
              : 'so bald wie möglich';
              
            await sendPaymentFailedEmail(
              profiles.email,
              invoice.amount_due,
              invoice.currency,
              'pro', // Default to pro, should be retrieved from profile
              nextBillingDate
            );
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
