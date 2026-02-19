import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generatePaymentFailedEmailContent } from '@/components/email/PaymentFailedEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface PaymentFailedRequest {
  email: string;
  firstName?: string;
  amount: number;
  currency?: string;
  planName: string;
  nextBillingDate: string;
}

export async function POST(request: Request) {
  try {
    const body: PaymentFailedRequest = await request.json();
    const {
      email,
      firstName,
      amount,
      currency = 'eur',
      planName,
      nextBillingDate,
    } = body;

    if (!email || !amount || !planName || !nextBillingDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const dashboardUrl = `${appUrl}/dashboard`;
    const supportUrl = 'mailto:support@paymodel.ai';

    const { subject, html, text } = generatePaymentFailedEmailContent({
      firstName,
      amount,
      currency,
      planName,
      nextBillingDate,
      dashboardUrl,
      supportUrl,
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
    console.error('Payment failed email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
