import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generatePaymentConfirmationEmailContent } from '@/components/email/PaymentConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface PaymentConfirmationRequest {
  email: string;
  firstName?: string;
  amount: number;
  currency?: string;
  planName: string;
  invoiceUrl: string;
  invoiceNumber: string;
  paymentDate?: string;
  nextBillingDate: string;
}

export async function POST(request: Request) {
  try {
    const body: PaymentConfirmationRequest = await request.json();
    const {
      email,
      firstName,
      amount,
      currency = 'eur',
      planName,
      invoiceUrl,
      invoiceNumber,
      paymentDate,
      nextBillingDate,
    } = body;

    if (!email || !amount || !planName || !invoiceUrl || !invoiceNumber || !nextBillingDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const formattedPaymentDate = paymentDate || new Date().toLocaleDateString('de-DE');

    const { subject, html, text } = generatePaymentConfirmationEmailContent({
      firstName,
      amount,
      currency,
      planName,
      invoiceUrl,
      invoiceNumber,
      paymentDate: formattedPaymentDate,
      nextBillingDate,
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
    console.error('Payment confirmation email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
