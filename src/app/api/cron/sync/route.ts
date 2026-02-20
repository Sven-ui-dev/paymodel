import { NextResponse } from 'next/server';

// Vercel Cron Job - runs automatically on schedule
// Configure in vercel.json

const EXCHANGE_RATE_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

async function fetchExchangeRate(): Promise<number> {
  try {
    const response = await fetch(EXCHANGE_RATE_URL);
    const data = await response.json();
    return data.rates?.EUR || 0.85;
  } catch {
    return 0.85;
  }
}

async function getOpenRouterModels() {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://paymodel.ai',
    },
  });
  const data = await response.json();
  return data.data || [];
}

export async function GET() {
  try {
    const exchangeRate = await fetchExchangeRate();
    const openrouterModels = await getOpenRouterModels();
    
    console.log(`🚀 Cron Sync: Found ${openrouterModels.length} models on OpenRouter`);
    console.log(`💱 Exchange rate: 1 USD = ${exchangeRate.toFixed(4)} EUR`);
    
    // This is a simple status endpoint
    // Full sync should be done via scripts/sync-openrouter.js
    
    return NextResponse.json({
      success: true,
      message: 'Cron job executed',
      models: openrouterModels.length,
      exchangeRate,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Cron job failed:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
