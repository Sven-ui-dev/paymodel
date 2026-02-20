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
    const { models, input_tokens, output_tokens } = body;

    if (!models || !Array.isArray(models) || models.length === 0) {
      return NextResponse.json({ error: 'models array is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('current_prices')
      .select('model_name, model_slug, provider_name, provider_slug, input_price_per_million, output_price_per_million, currency, context_window')
      .in('model_slug', models);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const input = input_tokens || 0;
    const output = output_tokens || 0;

    const comparison = (data || []).map(model => {
      const inputCost = (input / 1000000) * model.input_price_per_million;
      const outputCost = (output / 1000000) * model.output_price_per_million;
      const totalCost = inputCost + outputCost;

      return {
        model: model.model_name,
        provider: model.provider_name,
        input_price: model.input_price_per_million,
        output_price: model.output_price_per_million,
        currency: model.currency,
        context_window: model.context_window,
        costs: {
          input_tokens: input,
          output_tokens: output,
          input_cost: inputCost,
          output_cost: outputCost,
          total_cost: totalCost,
          formatted: `€${totalCost.toFixed(4)}`,
        },
      };
    }).sort((a, b) => a.costs.total_cost - b.costs.total_cost);

    return NextResponse.json({
      comparison,
      summary: {
        cheapest: comparison[0]?.model,
        cheapest_cost: comparison[0]?.costs.formatted,
        most_expensive: comparison[comparison.length - 1]?.model,
        most_expensive_cost: comparison[comparison.length - 1]?.costs.formatted,
        savings_potential: comparison.length > 1 
          ? (comparison[comparison.length - 1].costs.total_cost - comparison[0].costs.total_cost).toFixed(4)
          : 0,
      },
    });
  } catch (error) {
    console.error('Error comparing models:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
