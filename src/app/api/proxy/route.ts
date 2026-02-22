import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Provider API endpoints
const PROVIDER_ENDPOINTS: Record<string, { baseUrl: string; authHeader: string }> = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    authHeader: 'Authorization',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    authHeader: 'Authorization',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    authHeader: 'x-api-key',
  },
  google: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1',
    authHeader: 'Authorization',
  },
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verifyUser(authHeader: string | null): Promise<{ error?: string; status?: number; userId?: string }> {
  if (!authHeader) return { error: 'No authorization', status: 401 };
  
  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return { error: 'Invalid token', status: 401 };
  }
  
  return { userId: data.user.id };
}

// Get user's API key from their metadata
async function getUserApiKey(userId: string, provider: any): Promise<string | null> {
  if (!provider) return null;
  
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  
  if (error || !data.user?.user_metadata?.api_keys) {
    return null;
  }
  
  return data.user.user_metadata.api_keys[provider] || null;
}

// Calculate costs based on provider pricing
function calculateCosts(provider: string, model: string, inputTokens: number, outputTokens: number) {
  // Simplified pricing - in production, fetch from database
  const pricing: Record<string, { inputPerM: number; outputPerM: number }> = {
    'openrouter:gpt-4': { inputPerM: 30, outputPerM: 60 },
    'openrouter:gpt-4-turbo': { inputPerM: 10, outputPerM: 30 },
    'openrouter:gpt-3.5-turbo': { inputPerM: 0.5, outputPerM: 1.5 },
    'openrouter:claude-3-opus': { inputPerM: 15, outputPerM: 75 },
    'openrouter:claude-3-sonnet': { inputPerM: 3, outputPerM: 15 },
    'openai:gpt-4': { inputPerM: 30, outputPerM: 60 },
    'openai:gpt-4-turbo': { inputPerM: 10, outputPerM: 30 },
    'openai:gpt-3.5-turbo': { inputPerM: 0.5, outputPerM: 1.5 },
    'anthropic:claude-3-opus': { inputPerM: 15, outputPerM: 75 },
    'anthropic:claude-3-sonnet': { inputPerM: 3, outputPerM: 15 },
    'anthropic:claude-3-haiku': { inputPerM: 0.25, outputPerM: 1.25 },
    'google:gemini-pro': { inputPerM: 1.25, outputPerM: 5 },
  };
  
  const key = `${provider}:${model}`;
  const prices = pricing[key] || { inputPerM: 1, outputPerM: 1 }; // Default fallback
  
  return {
    inputCost: (inputTokens / 1000000) * prices.inputPerM,
    outputCost: (outputTokens / 1000000) * prices.outputPerM,
  };
}

// POST /api/proxy - Proxy API calls and track usage
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const auth = await verifyUser(authHeader);
  
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json() as { provider?: string; model?: string; messages?: any[]; max_tokens?: number };
    const provider = body.provider;
    const model = body.model;
    const messages = body.messages;

    if (!provider || !model) {
      return NextResponse.json({ error: 'Provider and model required' }, { status: 400 });
    }

    if (!auth.userId) {
      return NextResponse.json({ error: 'Invalid auth' }, { status: 401 });
    }

    // Get user's API key for this provider
    const providerKey = provider as string;
    const { data: userData } = await supabase.auth.admin.getUserById(auth.userId);
    const userApiKey = userData?.user?.user_metadata?.api_keys?.[providerKey];
    
    if (!userApiKey) {
      return NextResponse.json({ error: `No API key configured for ${provider}` }, { status: 400 });
    }

    // Get provider endpoint
    const providerConfig = PROVIDER_ENDPOINTS[providerKey];
    if (!providerConfig) {
      return NextResponse.json({ error: `Provider ${provider} not supported` }, { status: 400 });
    }

    // Estimate tokens (simple estimation)
    const inputText = messages?.map((m: any) => m.content).join(' ') || '';
    const estimatedInputTokens = Math.ceil(inputText.length / 4);
    let estimatedOutputTokens = 0;
    let responseData: any = null;

    try {
      // Make request to provider
      const response = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          [providerConfig.authHeader]: userApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: body.max_tokens || 1024,
        }),
      });

      responseData = await response.json();
      
      // Extract output tokens from response
      if (responseData.usage?.completion_tokens) {
        estimatedOutputTokens = responseData.usage.completion_tokens;
      }
    } catch (apiError: any) {
      return NextResponse.json({ error: apiError.message }, { status: 500 });
    }

    // Calculate costs
    const { inputCost, outputCost } = calculateCosts(provider, model, estimatedInputTokens, estimatedOutputTokens);
    const totalCost = inputCost + outputCost;

    // Save to api_usage table
    const { error: insertError } = await supabase.from('api_usage').insert({
      user_id: auth.userId,
      provider,
      model_slug: model,
      model_name: model,
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      input_cost: inputCost,
      output_cost: outputCost,
      total_cost: totalCost,
    });

    if (insertError) {
      console.error('Error tracking usage:', insertError);
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/proxy - Get user's usage
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const auth = await verifyUser(authHeader);
  
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const days = parseInt(searchParams.get('days') || '30');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query = supabase
    .from('api_usage')
    .select('*')
    .eq('user_id', auth.userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (provider) {
    query = query.eq('provider', provider);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate totals
  const totalCost = data?.reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0) || 0;
  const totalInputTokens = data?.reduce((sum, item) => sum + (item.input_tokens || 0), 0) || 0;
  const totalOutputTokens = data?.reduce((sum, item) => sum + (item.output_tokens || 0), 0) || 0;

  return NextResponse.json({
    usage: data,
    summary: {
      totalCost,
      totalInputTokens,
      totalOutputTokens,
      requestCount: data?.length || 0,
    },
  });
}
