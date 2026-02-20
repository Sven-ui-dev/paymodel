import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verify API key
async function verifyApiKey(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('pk_')) {
    return { error: 'Invalid API key', status: 401 };
  }

  const key = authHeader.replace('Bearer ', '');
  const keyHash = require('crypto').createHash('sha256').update(key).digest('hex');

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .select('id, user_id, is_active, expires_at')
    .eq('key_hash', keyHash)
    .single();

  if (error || !apiKey) {
    return { error: 'Invalid API key', status: 401 };
  }

  if (!apiKey.is_active) {
    return { error: 'API key is deactivated', status: 403 };
  }

  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return { error: 'API key has expired', status: 403 };
  }

  return { userId: apiKey.user_id, keyId: apiKey.id };
}

// GET /api/v1/models - List all models
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const capabilities = searchParams.get('capabilities');
    const minContext = searchParams.get('min_context');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let query = supabase
      .from('current_prices')
      .select('model_name, model_slug, provider_name, provider_slug, input_price_per_million, output_price_per_million, currency, context_window, capabilities, sort_order')
      .gte('input_price_per_million', 0)
      .range(offset, offset + limit - 1);

    if (provider) {
      query = query.eq('provider_slug', provider);
    }

    if (capabilities) {
      query = query.contains('capabilities', [capabilities]);
    }

    if (minContext) {
      query = query.gte('context_window', parseInt(minContext));
    }

    const { data, error } = await query.order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update usage stats
    await supabase
      .from('api_keys')
      .update({ 
        usage_count: supabase.rpc('increment', { row_id: auth.keyId, col: 'usage_count' }),
        last_used_at: new Date().toISOString()
      })
      .eq('id', auth.keyId);

    return NextResponse.json({
      models: data || [],
      pagination: {
        limit,
        offset,
        count: data?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
