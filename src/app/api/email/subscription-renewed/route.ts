import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateSubscriptionRenewedEmailContent } from '@/components/email/SubscriptionRenewedEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SubscriptionRenewedRequest {
  email: string;
  firstName?: string;
  amount: number;
  currency?: string;
  planName: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
}

export async function POST(request: Request) {
  try {
    const body: SubscriptionRenewedRequest = await request.json();
    const {
      email,
      firstName,
      amount,
      currency = 'eur',
      planName,
      currentPeriodEnd,
      nextBillingDate,
    } = body;

    if (!email || !amount || !planName || !currentPeriodEnd || !nextBillingDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dashboardUrl = `${appUrl}/dashboard`;

    const { subject, html, text } = generateSubscriptionRenewedEmailContent({
      firstName,
      amount,
      currency,
      planName,
      currentPeriodEnd,
      nextBillingDate,
      dashboardUrl,
    });

    const { data, error } = await resend.emails.send({
      from: 'paymodel.ai <waitlist@paymodel.ai>',
      to: [email],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Subscription renewed email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
