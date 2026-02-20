import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client without auto-refresh
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET(request: NextRequest) {
  // Check API key
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('pk_')) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const key = authHeader.replace('Bearer ', '');
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');

  try {
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .select('id, user_id, is_active, expires_at')
      .eq('key_hash', keyHash)
      .single();

    if (error || !apiKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    if (!apiKey.is_active) {
      return NextResponse.json({ error: 'API key is deactivated' }, { status: 403 });
    }

    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return NextResponse.json({ error: 'API key has expired' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  // Get query params
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let query = supabase
      .from('current_prices')
      .select('model_name, model_slug, provider_name, provider_slug, input_price_per_million, output_price_per_million, currency, context_window, capabilities, sort_order')
      .gte('input_price_per_million', 0)
      .range(offset, offset + limit - 1);

    if (provider) {
      query = query.eq('provider_slug', provider);
    }

    const { data, error } = await query.order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      models: data || [],
      pagination: { limit, offset, count: data?.length || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
