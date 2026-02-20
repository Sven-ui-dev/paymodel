import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Generate a secure API key
function generateApiKey() {
  const bytes = crypto.randomBytes(32);
  const key = 'pk_' + bytes.toString('hex');
  const keyPrefix = key.substring(0, 10);
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, keyPrefix, keyHash };
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_plan !== 'business') {
      return NextResponse.json({ error: 'Business plan required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, expires_in_days } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { key, keyPrefix, keyHash } = generateApiKey();

    const expiresAt = expires_in_days 
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      key: key,
      key_id: data.id,
      name: data.name,
      created_at: data.created_at,
      expires_at: expiresAt,
      warning: 'Store this key securely. You will not be able to see it again.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, is_active, last_used_at, created_at, expires_at, usage_count, usage_cost')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mask the keys
    const maskedData = data?.map(key => ({
      ...key,
      key: key.key_prefix + '************************',
    })) || [];

    return NextResponse.json({ keys: maskedData });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
