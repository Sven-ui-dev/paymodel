#!/bin/bash
# Quick fix: Add prices for all models missing them

export PATH=/opt/homebrew/bin:$PATH
export NEXT_PUBLIC_SUPABASE_URL="https://caamywhuejgexlcvupod.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="sbp_d23085c82c3a0c3ee2499759c9363fd97853504f"

cd /Users/svengrewe/.openclaw/workspace/paymodel-ai

# Try with service role key first
if /opt/homebrew/bin/node -e "
const https = require('https');

const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';
const SUPABASE_URL = 'https://caamywhuejgexlcvupod.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let exchangeRate = 0.8450;

async function fetchExchangeRate() {
  return new Promise((resolve, reject) => {
    https.get(EXCHANGE_API, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const r = JSON.parse(data);
          exchangeRate = r.rates?.EUR || 0.8450;
          console.log('Exchange rate:', exchangeRate);
          resolve();
        } catch (e) { resolve(); }
      });
    }).on('error', () => resolve());
  });
}

function fetchModels() {
  return new Promise((resolve, reject) => {
    https.get(OPENROUTER_API, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).data || []);
        } catch (e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

function usdToEur(usd) { return usd * exchangeRate * 1000000; }

function httpRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) { resolve(null); }
        else if (data.trim()) { resolve(JSON.parse(data)); }
        else { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getModelsWithoutPrices() {
  const url = SUPABASE_URL + '/rest/v1/models?select=id,name,slug';
  const models = await httpRequest(url);
  const prices = await httpRequest(SUPABASE_URL + '/rest/v1/prices?select=model_id');
  const withPrices = new Set(prices?.map(p => p.model_id) || []);
  return models?.filter(m => !withPrices.has(m.id)) || [];
}

async function insertPrice(modelId, inputUsd, outputUsd) {
  const url = SUPABASE_URL + '/rest/v1/prices';
  await httpRequest(url, 'POST', {
    model_id: modelId,
    input_price_per_million: Math.round(usdToEur(inputUsd) * 10000) / 10000,
    output_price_per_million: Math.round(usdToEur(outputUsd) * 10000) / 10000,
    effective_date: new Date().toISOString().split('T')[0],
    currency: 'EUR'
  });
}

async function main() {
  await fetchExchangeRate();
  const openrouterModels = await fetchModels();
  const missingModels = await getModelsWithoutPrices();
  
  console.log('Missing prices:', missingModels.length);
  
  let added = 0;
  for (const m of missingModels) {
    const orModel = openrouterModels.find(om => {
      const slug = (om.id.split('/').pop() || om.id).toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50);
      return slug === m.slug;
    });
    
    if (orModel?.pricing) {
      const input = parseFloat(orModel.pricing.prompt || 0) * 1000000;
      const output = parseFloat(orModel.pricing.completion || 0) * 1000000;
      await insertPrice(m.id, input, output);
      console.log('Added:', m.name);
      added++;
    }
  }
  
  console.log('Done. Added', added, 'prices');
}

main().catch(console.error);
" 2>&1; then
echo "---"
echo "Trying with anon key..."
/opt/homebrew/bin/node -e "
const https = require('https');

const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';
const SUPABASE_URL = 'https://caamywhuejgexlcvupod.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HqQVymk9xKsfmKjDmqCGyA_A2fpoSV2';

let exchangeRate = 0.8450;

async function fetchExchangeRate() {
  return new Promise((resolve, reject) => {
    https.get(EXCHANGE_API, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const r = JSON.parse(data);
          exchangeRate = r.rates?.EUR || 0.8450;
          console.log('Exchange rate:', exchangeRate);
          resolve();
        } catch (e) { resolve(); }
      });
    }).on('error', () => resolve());
  });
}

function fetchModels() {
  return new Promise((resolve, reject) => {
    https.get(OPENROUTER_API, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).data || []);
        } catch (e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

function usdToEur(usd) { return usd * exchangeRate * 1000000; }

function httpRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) { resolve(null); }
        else if (data.trim()) { resolve(JSON.parse(data)); }
        else { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getModelsWithoutPrices() {
  const url = SUPABASE_URL + '/rest/v1/models?select=id,name,slug';
  const models = await httpRequest(url);
  const prices = await httpRequest(SUPABASE_URL + '/rest/v1/prices?select=model_id');
  const withPrices = new Set(prices?.map(p => p.model_id) || []);
  return models?.filter(m => !withPrices.has(m.id)) || [];
}

async function insertPrice(modelId, inputUsd, outputUsd) {
  const url = SUPABASE_URL + '/rest/v1/prices';
  await httpRequest(url, 'POST', {
    model_id: modelId,
    input_price_per_million: Math.round(usdToEur(inputUsd) * 10000) / 10000,
    output_price_per_million: Math.round(usdToEur(outputUsd) * 10000) / 10000,
    effective_date: new Date().toISOString().split('T')[0],
    currency: 'EUR'
  });
}

async function main() {
  await fetchExchangeRate();
  const openrouterModels = await fetchModels();
  const missingModels = await getModelsWithoutPrices();
  
  console.log('Missing prices:', missingModels.length);
  
  let added = 0;
  for (const m of missingModels) {
    const orModel = openrouterModels.find(om => {
      const slug = (om.id.split('/').pop() || om.id).toLowerCase().replace(/[^a-z0-9-]/g, '-').substring(0, 50);
      return slug === m.slug;
    });
    
    if (orModel?.pricing) {
      const input = parseFloat(orModel.pricing.prompt || 0) * 1000000;
      const output = parseFloat(orModel.pricing.completion || 0) * 1000000;
      await insertPrice(m.id, input, output);
      console.log('Added:', m.name);
      added++;
    }
  }
  
  console.log('Done. Added', added, 'prices');
}

main().catch(console.error);
"
