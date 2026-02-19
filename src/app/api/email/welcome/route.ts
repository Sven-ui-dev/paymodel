import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateWelcomeEmailContent } from '@/components/email/WelcomeEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
  planName: 'pro' | 'business';
}

export async function POST(request: Request) {
  try {
    const body: WelcomeEmailRequest = await request.json();
    const { email, firstName, planName } = body;

    if (!email || !planName) {
      return NextResponse.json(
        { error: 'Email and planName are required' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/dashboard`;
    const supportUrl = 'mailto:support@paymodel.ai';

    const { subject, html, text } = generateWelcomeEmailContent({
      firstName,
      planName,
      loginUrl,
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
    console.error('Welcome email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
