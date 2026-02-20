import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyApiKey(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('pk_')) {
    return { error: 'Invalid API key', status: 401 };
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
      return { error: 'Invalid API key', status: 401 };
    }

    if (!apiKey.is_active) {
      return { error: 'API key is deactivated', status: 403 };
    }

    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return { error: 'API key has expired', status: 403 };
    }

    return { userId: apiKey.user_id, keyId: apiKey.id };
  } catch {
    return { error: 'Invalid API key', status: 401 };
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyApiKey(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { model, input_tokens, output_tokens, monthly_input, monthly_output } = body;

    if (!model) {
      return NextResponse.json({ error: 'model is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('current_prices')
      .select('model_name, model_slug, provider_name, provider_slug, input_price_per_million, output_price_per_million, currency, context_window')
      .eq('model_slug', model)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const inputTokens = input_tokens || 0;
    const outputTokens = output_tokens || 0;
    const inputCost = (inputTokens / 1000000) * data.input_price_per_million;
    const outputCost = (outputTokens / 1000000) * data.output_price_per_million;
    const totalCost = inputCost + outputCost;

    const monthlyInput = monthly_input || 0;
    const monthlyOutput = monthly_output || 0;
    const monthlyInputCost = (monthlyInput / 1000000) * data.input_price_per_million;
    const monthlyOutputCost = (monthlyOutput / 1000000) * data.output_price_per_million;
    const totalMonthlyCost = monthlyInputCost + monthlyOutputCost;
    const yearlyCost = totalMonthlyCost * 12;

    return NextResponse.json({
      model: {
        name: data.model_name,
        slug: data.model_slug,
        provider: data.provider_name,
      },
      pricing: {
        input_per_million: data.input_price_per_million,
        output_per_million: data.output_price_per_million,
        currency: data.currency,
        context_window: data.context_window,
      },
      calculation: {
        one_time: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          input_cost: inputCost,
          output_cost: outputCost,
          total_cost: totalCost,
          formatted: `€${totalCost.toFixed(4)}`,
        },
        monthly: {
          input_tokens: monthlyInput,
          output_tokens: monthlyOutput,
          input_cost: monthlyInputCost,
          output_cost: monthlyOutputCost,
          total_cost: totalMonthlyCost,
          formatted: `€${totalMonthlyCost.toFixed(2)}`,
        },
        yearly: {
          total_cost: yearlyCost,
          formatted: `€${yearlyCost.toFixed(2)}`,
        },
      },
    });
  } catch (error) {
    console.error('Error calculating costs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
