import { NextRequest, NextResponse } from 'next/server';

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

async function verifySession(authHeader: string | null) {
  if (!authHeader) {
    return { error: 'Authorization required', status: 401 };
  }
  
  const { data: userData, error } = await supabaseRequest('/auth/v1/user', {
    headers: { 'Authorization': authHeader }
  });
  
  if (!userData || error) {
    return { error: 'Invalid session', status: 401 };
  }
  
  return { userId: userData.id };
}

// POST /api/benchmark - Save benchmark result
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const auth = await verifySession(authHeader);
  
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { prompt, model_slug, provider_slug, input_tokens, output_tokens, input_cost, output_cost, total_cost, response_text, response_time_ms } = body;

    const { data, error } = await supabaseRequest('/rest/v1/benchmark_results', {
      method: 'POST',
      body: JSON.stringify({
        user_id: auth.userId,
        prompt,
        model_slug,
        provider_slug,
        input_tokens,
        output_tokens,
        input_cost,
        output_cost,
        total_cost,
        response_text,
        response_time_ms,
      }),
    });

    if (error) {
      return NextResponse.json({ error: error.message || error.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving benchmark:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/benchmark - Get benchmark history
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const auth = await verifySession(authHeader);
  
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { data, error } = await supabaseRequest(
      `/rest/v1/benchmark_results?user_id=eq.${auth.userId}&order=created_at.desc&limit=50`
    );

    if (error) {
      return NextResponse.json({ error: error.message || error.error }, { status: 500 });
    }

    return NextResponse.json({ history: data || [] });
  } catch (error) {
    console.error('Error loading history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
