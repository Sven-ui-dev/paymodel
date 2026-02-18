import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Bitte eine gültige E-Mail-Adresse eingeben.' },
        { status: 400 }
      );
    }

    // Insert into waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ 
        email: email.toLowerCase().trim(),
        source: 'paymodel.ai',
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Diese E-Mail-Adresse ist bereits registriert.' },
          { status: 409 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Fehler bei der Anmeldung. Bitte später erneut versuchen.' },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'paymodel.ai <waitlist@paymodel.ai>',
          to: email,
          subject: 'Bestätigung: Du bist auf der Early Access Warteliste!',
          html: `
            <h1>Vielen Dank!</h1>
            <p>Du hast dich erfolgreich für den Early Access von paymodel.ai angemeldet.</p>
            <p>Wir benachrichtigen dich, sobald du Zugang zum personalisierten Benchmark-Service erhältst.</p>
            <br/>
            <p>Dein paymodel.ai Team</p>
          `
        });
        console.log('📧 Confirmation email sent to:', email);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    // Log new signup
    console.log('📧 New waitlist signup:', email);

    return NextResponse.json({ 
      success: true, 
      message: 'Vielen Dank! Du bist auf der Warteliste.',
      data
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
