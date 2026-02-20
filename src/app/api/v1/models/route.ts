import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function supabaseRequest(path: string, options: any = {}) {
  const url = `${SUPABASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  return { data, error: response.ok ? null : data, status: response.status };
}

async function verifyApiKey(authHeader: string | null) {
  if (!authHeader?.startsWith('pk_')) {
    return { error: 'Invalid API key', status: 401 };
  }

  const key = authHeader.replace('Bearer ', '');
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');

  const { data: apiKey, error } = await supabaseRequest(`/rest/v1/api_keys?key_hash=eq.${keyHash}&select=id,user_id,is_active,expires_at`);

  if (error || !apiKey || apiKey.length === 0) {
    return { error: 'Invalid API key', status: 401 };
  }

  const keyData = apiKey[0];
  
  if (!keyData.is_active) {
    return { error: 'API key is deactivated', status: 403 };
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { error: 'API key has expired', status: 403 };
  }

  return { userId: keyData.user_id, keyId: keyData.id };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const auth = await verifyApiKey(authHeader);
  
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = `/rest/v1/current_prices?select=model_name,model_slug,provider_name,provider_slug,input_price_per_million,output_price_per_million,currency,context_window,capabilities,sort_order&input_price_per_million=gte.0&limit=${limit}&offset=${offset}&sort=sort_order.asc`;

  if (provider) {
    query += `&provider_slug=eq.${provider}`;
  }

  const { data, error } = await supabaseRequest(query);

  if (error) {
    return NextResponse.json({ error: error.message || error.error }, { status: 500 });
  }

  return NextResponse.json({
    models: data || [],
    pagination: { limit, offset, count: data?.length || 0 },
  });
}
