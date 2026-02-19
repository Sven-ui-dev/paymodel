import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, model_id, target_price, current_price } = body;

    // Validierung
    if (!user_id || !model_id || !target_price) {
      return NextResponse.json(
        { error: 'user_id, model_id und target_price sind erforderlich' },
        { status: 400 }
      );
    }

    // Prüfen ob bereits ein aktiver Alert existiert
    const { data: existingAlert } = await supabase
      .from('price_alerts')
      .select('id')
      .eq('user_id', user_id)
      .eq('model_id', model_id)
      .eq('is_active', true)
      .single();

    if (existingAlert) {
      return NextResponse.json(
        { error: 'Es existiert bereits ein aktiver Alert für dieses Modell' },
        { status: 409 }
      );
    }

    // Alert erstellen
    const { data, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id,
        model_id,
        target_price,
        current_price,
        is_active: true,
        is_triggered: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating price alert:', error);
      return NextResponse.json(
        { error: 'Fehler beim Erstellen des Alerts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
