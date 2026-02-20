/**
 * Sync paymodel.ai DB with OpenRouter
 * - Adds new models from OpenRouter
 * - Updates existing models
 * - Deletes models from DB that no longer exist in OpenRouter
 * 
 * Usage: node scripts/sync-openrouter.js
 */

const https = require('https');

// OpenRouter API - models endpoint (public, no auth needed)
const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';

// Supabase connection
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Exchange rate
let exchangeRate = 0.85;

// Fetch exchange rate
async function fetchExchangeRate() {
  return new Promise((resolve) => {
    https.get('https://api.exchangerate-api.com/v4/latest/USD', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const rate = JSON.parse(data).rates?.EUR || 0.85;
          exchangeRate = rate;
          console.log(`💱 Exchange rate: 1 USD = ${rate.toFixed(4)} EUR`);
          resolve(rate);
        } catch (e) {
          resolve(0.85);
        }
      });
    }).on('error', () => resolve(0.85));
  });
}

// Fetch models from OpenRouter
function fetchOpenRouterModels() {
  return new Promise((resolve, reject) => {
    https.get(OPENROUTER_API, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const models = JSON.parse(data).data || [];
          console.log(`📡 Found ${models.length} models on OpenRouter`);
          resolve(models);
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    }).on('error', reject);
  });
}

// Clean Supabase URL
function getRestUrl(path) {
  let url = SUPABASE_URL.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  return `${url}/rest/v1${path}`;
}

// HTTP helper
function httpRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(getRestUrl(path));
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        } else if (data.trim() && !path.includes('DELETE')) {
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

// Detect provider from model ID
function detectProvider(modelId) {
  const id = modelId.toLowerCase();
  if (id.includes('gpt-') || id.includes('openai')) return 'OpenAI';
  if (id.includes('claude') || id.includes('anthropic')) return 'Anthropic';
  if (id.includes('gemini') || id.includes('google')) return 'Google';
  if (id.includes('mistral')) return 'Mistral AI';
  if (id.includes('deepseek')) return 'DeepSeek';
  if (id.includes('llama')) return 'Meta';
  if (id.includes('grok')) return 'xAI';
  if (id.includes('command') || id.includes('cohere')) return 'Cohere';
  if (id.includes('sonar') || id.includes('perplexity')) return 'Perplexity';
  if (id.includes('bedrock') || id.includes('amazon')) return 'AWS Bedrock';
  if (id.includes('groq')) return 'Groq';
  if (id.includes('minimax')) return 'Minimax';
  if (id.includes('moonshot')) return 'MoonshotAI';
  if (id.includes('z-ai') || id.includes('glm')) return 'Z-ai';
  return 'OpenRouter';
}

// Generate slug from OpenRouter model
function generateSlug(model) {
  if (model.canonical_slug) {
    return model.canonical_slug.toLowerCase().replace(/[^a-z0-9-/]/g, '-').split('/').pop();
  }
  const name = model.id.split('/').pop() || model.id;
  return name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').substring(0, 50);
}

// Extract capabilities from OpenRouter model
function extractCapabilities(model) {
  const caps = [];
  const capsList = model.capabilities || [];
  const modalities = model.architecture?.input_modalities || [];
  
  if (modalities.includes('text') || capsList.includes('text')) caps.push('text');
  if (modalities.includes('image') || capsList.includes('vision') || capsList.includes('images')) caps.push('vision');
  if (modalities.includes('audio') || capsList.includes('audio')) caps.push('audio');
  if (capsList.includes('coding') || capsList.includes('tools')) caps.push('coding');
  if (capsList.includes('reasoning')) caps.push('reasoning');
  if (caps.length === 0) caps.push('text');
  
  return caps;
}

// Main sync function
async function sync() {
  console.log('\n🚀 Starting DB Sync with OpenRouter...\n');
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }
  
  try {
    await fetchExchangeRate();
    const openrouterModels = await fetchOpenRouterModels();
    
    // Get existing data
    const existingModels = await httpRequest('/models?select=id,slug,provider_id', 'GET');
    const existingProviders = await httpRequest('/providers?select=id,name,slug', 'GET');
    const existingPrices = await httpRequest('/prices?select=model_id,effective_date', 'GET');
    
    const modelSlugs = new Set(existingModels?.map(m => m.slug) || []);
    const providerMap = {};
    existingProviders?.forEach(p => {
      providerMap[p.slug.toLowerCase()] = p;
      providerMap[p.name.toLowerCase()] = p;
    });
    
    // Get latest prices per model
    const latestPrices = {};
    existingPrices?.forEach(p => {
      if (!latestPrices[p.model_id] || p.effective_date > latestPrices[p.model_id]) {
        latestPrices[p.model_id] = p;
      }
    });
    
    console.log(`📊 DB has ${modelSlugs.size} models, ${existingProviders?.length} providers`);
    
    // Build OpenRouter model lookup
    const openrouterLookup = {};
    openrouterModels.forEach(m => {
      const slug = generateSlug(m);
      openrouterLookup[slug] = m;
      openrouterLookup[m.id.toLowerCase()] = m;
    });
    
    // Find models to delete (in DB but not in OpenRouter)
    const modelsToDelete = existingModels.filter(m => {
      const slug = m.slug.toLowerCase();
      return !openrouterLookup[slug] && !openrouterLookup[m.id?.toLowerCase()];
    });
    
    console.log(`🗑️ Models to delete: ${modelsToDelete.length}`);
    
    // Delete models
    let deleted = 0;
    for (const m of modelsToDelete) {
      await httpRequest(`/models?id=eq.${m.id}`, 'DELETE');
      deleted++;
    }
    console.log(`✅ Deleted ${deleted} models`);
    
    // Process OpenRouter models
    let newModels = 0, updatedPrices = 0, skipped = 0;
    
    for (const model of openrouterModels) {
      const id = model.id;
      const name = id.split('/').pop() || id;
      const slug = generateSlug(model);
      const providerName = detectProvider(id);
      const providerSlug = providerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      let providerId = providerMap[providerSlug]?.id || providerMap[providerName.toLowerCase()]?.id;
      
      if (!providerId) {
        // Create provider
        const result = await httpRequest('/providers', 'POST', {
          name: providerName,
          slug: providerSlug,
          is_active: true,
          sort_order: 99
        });
        providerId = result?.[0]?.id || result?.id;
        providerMap[providerSlug] = { id: providerId, slug: providerSlug, name: providerName };
        console.log(`🆕 New provider: ${providerName}`);
      }
      
      const modelExists = modelSlugs.has(slug);
      
      if (!modelExists) {
        // Insert new model
        const modelData = {
          provider_id: providerId,
          name: name,
          slug: slug,
          context_length: model.context_length || 4096,
          max_output_tokens: model.max_completion_tokens || model.max_tokens || 4096,
          capabilities: extractCapabilities(model),
          is_active: true,
          sort_order: 99
        };
        
        const result = await httpRequest('/models', 'POST', modelData);
        const modelId = result?.[0]?.id || result?.id;
        modelSlugs.add(slug);
        
        // Insert price
        const pricing = model.pricing || {};
        const inputPrice = (parseFloat(pricing.prompt || 0)) * 1000000 * exchangeRate;
        const outputPrice = (parseFloat(pricing.completion || 0)) * 1000000 * exchangeRate;
        
        await httpRequest('/prices', 'POST', {
          model_id: modelId,
          input_price_per_million: Math.round(inputPrice * 10000) / 10000,
          output_price_per_million: Math.round(outputPrice * 10000) / 10000,
          effective_date: new Date().toISOString().split('T')[0],
          currency: 'EUR'
        });
        
        newModels++;
        console.log(`🆕 ${name} (${providerName}): €${inputPrice.toFixed(4)}/€${outputPrice.toFixed(4)}`);
      } else {
        // Check if price exists for today
        const existingModel = existingModels.find(m => m.slug === slug);
        const modelId = existingModel?.id;
        
        if (modelId && latestPrices[modelId]) {
          const pricing = model.pricing || {};
          const inputPrice = (parseFloat(pricing.prompt || 0)) * 1000000 * exchangeRate;
          const outputPrice = (parseFloat(pricing.completion || 0)) * 1000000 * exchangeRate;
          
          const oldInput = parseFloat(latestPrices[modelId].input_price_per_million || 0);
          const oldOutput = parseFloat(latestPrices[modelId].output_price_per_million || 0);
          
          if (Math.abs(oldInput - inputPrice) > 0.0001 || Math.abs(oldOutput - outputPrice) > 0.0001) {
            // Insert new price
            await httpRequest('/prices', 'POST', {
              model_id: modelId,
              input_price_per_million: Math.round(inputPrice * 10000) / 10000,
              output_price_per_million: Math.round(outputPrice * 10000) / 10000,
              effective_date: new Date().toISOString().split('T')[0],
              currency: 'EUR'
            });
            updatedPrices++;
          } else {
            skipped++;
          }
        }
      }
    }
    
    console.log('\n✅ Sync complete!');
    console.log(`   Deleted: ${deleted}`);
    console.log(`   New models: ${newModels}`);
    console.log(`   Price updates: ${updatedPrices}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total in DB: ${modelSlugs.size}`);
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  sync().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { sync };
