/**
 * OpenRouter Price Updater
 * Fetches all models from OpenRouter, converts USD to EUR using daily exchange rate
 * 
 * Usage: node scripts/openrouter-updater.js
 * 
 * Cron (daily at 2 AM):
 * 0 2 * * * cd /path/to/paymodel-ai && node scripts/openrouter-updater.js
 */

const https = require('https');

// OpenRouter API - models endpoint (public, no auth needed)
const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';

// Free exchange rate API (exchangerate-api.com - 1000 requests/month free)
const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/USD';

// Supabase connection
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Exchange rate cache
let exchangeRate = 0.95; // Default fallback rate (EUR per USD)

// Fetch daily USD to EUR exchange rate
async function fetchExchangeRate() {
  return new Promise((resolve, reject) => {
    console.log('💱 Fetching USD→EUR exchange rate...');
    
    const req = https.get(EXCHANGE_API, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const rate = response.rates?.EUR || 0.95;
          exchangeRate = rate;
          console.log(`✅ Exchange rate: 1 USD = ${rate.toFixed(4)} EUR`);
          resolve(rate);
        } catch (e) {
          console.warn(`⚠️ Failed to fetch exchange rate, using fallback: ${exchangeRate}`);
          resolve(exchangeRate);
        }
      });
    });
    req.on('error', (e) => {
      console.warn(`⚠️ Exchange rate fetch error: ${e.message}, using fallback: ${exchangeRate}`);
      resolve(exchangeRate);
    });
    req.end();
  });
}

// Convert USD to EUR (extractPricing already returns per million USD)
function usdToEur(usdPricePerMillion) {
  return usdPricePerMillion * exchangeRate;
}

// Clean Supabase URL - remove any trailing /rest/v1
function getRestUrl(path) {
  let url = SUPABASE_URL;
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/rest\/v1$/, '');
  return `${url}/rest/v1${path}`;
}

// HTTP helper
function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url);
    
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    };
    
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else if (data.trim()) {
          resolve(JSON.parse(data));
        } else {
          resolve(null);
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Supabase helper functions
async function supabaseGet(path) {
  return httpRequest({ url: getRestUrl(path), method: 'GET' });
}

async function supabasePost(path, body) {
  return httpRequest({ url: getRestUrl(path), method: 'POST' }, body);
}

async function supabasePatch(path, body) {
  return httpRequest({ url: getRestUrl(path), method: 'PATCH' }, body);
}

// Detect provider from model ID
function detectProvider(modelId) {
  const id = modelId.toLowerCase();
  
  if (id.includes('gpt-')) return 'OpenAI';
  if (id.includes('claude')) return 'Anthropic';
  if (id.includes('gemini')) return 'Google';
  if (id.includes('deepseek')) return 'DeepSeek';
  if (id.includes('mistral')) return 'Mistral AI';
  if (id.includes('llama')) return 'Meta';
  if (id.includes('grok')) return 'xAI';
  if (id.includes('command') || id.includes('cohere')) return 'Cohere';
  if (id.includes('sonar') || id.includes('perplexity')) return 'Perplexity';
  if (id.includes('nova') || id.includes('bedrock') || id.includes('amazon')) return 'AWS Bedrock';
  if (id.includes('groq') || id.includes('/groq')) return 'Groq';
  if (id.includes('minimax')) return 'Minimax';
  if (id.includes('moonshot') || id.includes('kimi')) return 'MoonshotAI';
  if (id.includes('z-ai') || id.includes('z-') || id.includes('glm')) return 'Z-ai';
  
  return 'OpenRouter';
}

// Parse OpenRouter pricing (returns USD per million tokens)
function extractPricing(pricing) {
  if (!pricing) return { input: 0, output: 0 };
  // OpenRouter pricing is per token, convert to per million tokens
  const inputPrice = (parseFloat(pricing.prompt || '0')) * 1000000;
  const outputPrice = (parseFloat(pricing.completion || '0')) * 1000000;
  return { input: inputPrice, output: outputPrice };
}

// Generate short slug from model ID
function generateSlug(modelId) {
  const name = modelId.split('/').pop() || modelId;
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  // Truncate to 50 chars and remove trailing dashes
  return slug.substring(0, 50).replace(/-+$/, '');
}

// Fetch models from OpenRouter
function fetchOpenRouterModels() {
  return new Promise((resolve, reject) => {
    console.log('📡 Fetching models from OpenRouter...');
    
    const req = https.get(OPENROUTER_API, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          const models = response.data || [];
          console.log(`✅ Found ${models.length} models on OpenRouter`);
          resolve(models);
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function getExistingProviders() {
  const result = await supabaseGet('/providers?select=id,name,slug');
  const providers = {};
  result?.forEach(p => {
    providers[p.slug?.toLowerCase()] = p;
    providers[p.name?.toLowerCase()] = p;
  });
  return providers;
}

async function getExistingModels() {
  const result = await supabaseGet('/models?select=id,slug');
  return new Set(result?.map(m => m.slug) || []);
}

async function getLatestPrices() {
  const result = await supabaseGet('/prices?select=model_id,input_price_per_million,output_price_per_million,effective_date&order=effective_date.desc');
  const latestPrices = {};
  result?.forEach(p => {
    if (!latestPrices[p.model_id]) {
      latestPrices[p.model_id] = p;
    }
  });
  return latestPrices;
}

async function upsertProvider(name, slug, websiteUrl = '', affiliateUrl = '') {
  const existing = await supabaseGet(`/providers?slug=eq.${slug}&select=id`);
  
  if (existing?.length > 0) {
    await supabasePatch(`/providers?id=eq.${existing[0].id}`, {
      name, slug, website_url: websiteUrl, affiliate_url: affiliateUrl, is_active: true
    });
    return existing[0].id;
  } else {
    const result = await supabasePost('/providers', {
      name, slug, website_url: websiteUrl, affiliate_url: affiliateUrl, is_active: true, sort_order: 99
    });
    return result?.[0]?.id || result?.id;
  }
}

async function upsertModel(providerId, name, slug, contextWindow, maxTokens, capabilities) {
  const existing = await supabaseGet(`/models?slug=eq.${slug}&select=id`);
  
  if (existing?.length > 0) {
    await supabasePatch(`/models?id=eq.${existing[0].id}`, {
      provider_id: providerId, name, slug, context_window: contextWindow,
      max_output_tokens: maxTokens, capabilities, is_active: true
    });
    return existing[0].id;
  } else {
    const result = await supabasePost('/models', {
      provider_id: providerId, name, slug, context_window: contextWindow,
      max_output_tokens: maxTokens, capabilities, is_active: true, sort_order: 99
    });
    return result?.[0]?.id || result?.id;
  }
}

async function insertPrice(modelId, inputPriceEur, outputPriceEur) {
  await supabasePost('/prices', {
    model_id: modelId,
    input_price_per_million: Math.round(inputPriceEur * 10000) / 10000,
    output_price_per_million: Math.round(outputPriceEur * 10000) / 10000,
    effective_date: new Date().toISOString().split('T')[0],
    currency: 'EUR'
  });
}

// Main update function
async function updatePrices() {
  try {
    console.log('\n🚀 Starting OpenRouter price update...\n');
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing Supabase credentials');
    }
    
    // Fetch exchange rate first
    await fetchExchangeRate();
    
    // Fetch models from OpenRouter
    const openrouterModels = await fetchOpenRouterModels();
    
    // Get existing data
    const existingProviders = await getExistingProviders();
    const existingModelSlugs = await getExistingModels();
    const latestPrices = await getLatestPrices();
    
    console.log(`📊 Existing providers: ${Object.keys(existingProviders).length}`);
    console.log(`📊 Existing models: ${existingModelSlugs.size}`);
    
    let newModels = 0, updatedPrices = 0, skipped = 0;
    let totalUsdSaved = 0;
    
    for (const model of openrouterModels) {
      const id = model.id;
      const name = id.split('/').pop() || id;
      // Create clean slug from model ID (max 50 chars)
      const slug = generateSlug(id);
      
      const capabilities = model.capabilities || [];
      const modalities = model.architecture?.input_modalities || [];
      const capsArray = [];
      
      // Use architecture modalities if available, fallback to legacy capabilities
      if (modalities.includes('text') || capabilities.includes('chat') || capabilities.includes('text')) capsArray.push('text');
      if (modalities.includes('image') || capabilities.includes('vision') || capabilities.includes('images')) capsArray.push('vision');
      if (modalities.includes('audio') || capabilities.includes('audio')) capsArray.push('audio');
      if (capabilities.includes('coding') || capabilities.includes('tools')) capsArray.push('coding');
      if (capabilities.includes('reasoning')) capsArray.push('reasoning');
      if (capsArray.length === 0) capsArray.push('text');
      
      const contextLength = model.context_length || model.max_tokens || 4096;
      const maxOutput = model.max_completion_tokens || model.max_tokens || 4096;
      const pricing = extractPricing(model.pricing);
      
      // Convert USD to EUR
      const inputPriceEur = usdToEur(pricing.input);
      const outputPriceEur = usdToEur(pricing.output);
      
      const providerName = detectProvider(id);
      const providerSlug = providerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      let providerId;
      if (existingProviders[providerSlug] || existingProviders[providerName.toLowerCase()]) {
        providerId = existingProviders[providerSlug]?.id || existingProviders[providerName.toLowerCase()]?.id;
      } else {
        providerId = await upsertProvider(providerName, providerSlug);
        existingProviders[providerSlug] = { id: providerId, slug: providerSlug, name: providerName };
        console.log(`🆕 New provider: ${providerName}`);
      }
      
      const modelExists = existingModelSlugs.has(slug);
      
      if (!modelExists) {
        const modelId = await upsertModel(providerId, name, slug, contextLength, maxOutput, capsArray);
        existingModelSlugs.add(slug);
        await insertPrice(modelId, inputPriceEur, outputPriceEur);
        newModels++;
        console.log(`🆕 ${name} (${providerName}): €${inputPriceEur.toFixed(4)}/€${outputPriceEur.toFixed(4)}`);
      } else {
        const existingModel = await supabaseGet(`/models?slug=eq.${slug}&select=id`);
        const modelId = existingModel?.[0]?.id;
        
        if (modelId && latestPrices[modelId]) {
          const oldInput = parseFloat(latestPrices[modelId].input_price_per_million || 0);
          const oldOutput = parseFloat(latestPrices[modelId].output_price_per_million || 0);
          
          const inputChanged = Math.abs(oldInput - inputPriceEur) > 0.0001;
          const outputChanged = Math.abs(oldOutput - outputPriceEur) > 0.0001;
          
          if (inputChanged || outputChanged) {
            await insertPrice(modelId, inputPriceEur, outputPriceEur);
            updatedPrices++;
            const usdSaved = (Math.abs(oldInput - inputPriceEur) + Math.abs(oldOutput - outputPriceEur)) * 100;
            totalUsdSaved += usdSaved;
            console.log(`💰 ${name}: €${oldInput.toFixed(4)}→€${inputPriceEur.toFixed(4)} | €${oldOutput.toFixed(4)}→€${outputPriceEur.toFixed(4)}`);
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      }
    }
    
    console.log('\n✅ Update complete!');
    console.log(`   Exchange rate: 1 USD = ${exchangeRate.toFixed(4)} EUR`);
    console.log(`   New models: ${newModels}`);
    console.log(`   Price updates: ${updatedPrices}`);
    console.log(`   Skipped: ${skipped}`);
    
    return { 
      success: true, 
      newModels, 
      updatedPrices, 
      skipped, 
      exchangeRate,
      totalModels: openrouterModels.length 
    };
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  updatePrices()
    .then(result => process.exit(result.success ? 0 : 1))
    .catch(error => { console.error('Fatal:', error); process.exit(1); });
}

module.exports = { updatePrices, fetchExchangeRate, usdToEur };
