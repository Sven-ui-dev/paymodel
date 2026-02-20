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

// HTTP helper with DELETE support
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
        } else if (data.trim() && !path.includes('DELETE') && method !== 'DELETE') {
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

// Delete price for today
async function deleteTodaysPrice(modelId) {
  const today = new Date().toISOString().split('T')[0];
  return new Promise((resolve) => {
    const url = new URL(getRestUrl(`/prices?model_id=eq.${modelId}&effective_date=eq.${today}`));
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve());
    });
    req.on('error', () => resolve());
    req.end();
  });
}

// Detect provider from model ID (using OpenRouter's provider info when available)
function detectProvider(model) {
  const id = model.id.toLowerCase();
  const name = model.name?.toLowerCase() || '';
  
  // Extract provider from OpenRouter model ID (format: provider/model-name)
  const providerFromId = model.id.split('/')[0].toLowerCase();
  
  // Map OpenRouter providers to our provider names
  const providerMap = {
    'anthropic': 'Anthropic',
    'openai': 'OpenAI',
    'google': 'Google',
    'mistral': 'Mistral AI',
    'deepseek': 'DeepSeek',
    'meta': 'Meta',
    'groq': 'Groq',
    'xai': 'xAI',
    'cohere': 'Cohere',
    'perplexity': 'Perplexity',
    'aws': 'AWS Bedrock',
    'bedrock': 'AWS Bedrock',
    'amazon': 'AWS Bedrock',
    'minimax': 'Minimax',
    'moonshotai': 'MoonshotAI',
    'moonshot': 'MoonshotAI',
    'z-ai': 'Z-ai',
    'zai': 'Z-ai',
    'openrouter': 'OpenRouter',
    'arcee-ai': 'Arcee AI',
    'arcee': 'Arcee AI',
    'upstage': 'Upstage',
    'stepfun': 'StepFun',
    'liquid': 'Liquid AI',
    'allenai': 'AllenAI',
    'olmo': 'AllenAI',
    'writer': 'Writer',
    'cogent': 'Cogent',
    'cogentlabs': 'Cogent',
    'neural': 'Neural',
    'cerebras': 'Cerebras',
    'nvidia': 'NVIDIA',
    'baidu': 'Baidu',
    'ernie': 'Baidu',
    'bytedance': 'ByteDance',
    'seed': 'ByteDance',
    'qwen': 'OpenRouter',
    'l3': 'OpenRouter',
    'llama': 'OpenRouter',
    'trinity': 'OpenRouter',
    'nova': 'OpenRouter',
    'bodybuilder': 'OpenRouter',
    'intellect': 'OpenRouter',
    'kat': 'OpenRouter',
    'jamba': 'OpenRouter',
    'mimo': 'OpenRouter',
    'cydonia': 'OpenRouter',
    'granite': 'OpenRouter',
    'tongyi': 'OpenRouter',
    'internvl': 'OpenRouter',
    'ui-tars': 'OpenRouter',
    'relace': 'OpenRouter',
    'rnj': 'OpenRouter',
    'auto': 'OpenRouter',
    'router': 'OpenRouter',
  };
  
  // Try to detect from ID first
  if (providerMap[providerFromId]) {
    return providerMap[providerFromId];
  }
  
  // Fall back to pattern matching
  if (id.includes('gpt-') || id.includes('openai')) return 'OpenAI';
  if (id.includes('claude')) return 'Anthropic';
  if (id.includes('gemini')) return 'Google';
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
  if (id.includes('arcee')) return 'Arcee AI';
  if (id.includes('upstage')) return 'Upstage';
  if (id.includes('stepfun')) return 'StepFun';
  if (id.includes('liquid')) return 'Liquid AI';
  if (id.includes('allenai') || id.includes('olmo')) return 'AllenAI';
  if (id.includes('writer')) return 'Writer';
  
  return 'OpenRouter'; // Default
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
      const slug = String(m.slug || '').toLowerCase();
      const modelId = String(m.id || '').toLowerCase();
      return !openrouterLookup[slug] && !openrouterLookup[modelId];
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
    let sortOrder = 1;
    
    for (const model of openrouterModels) {
      const id = model.id;
      const name = id.split('/').pop() || id;
      const slug = generateSlug(model);
      const providerName = detectProvider(model);
      const providerSlug = providerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      let providerId = providerMap[providerSlug]?.id || providerMap[providerName.toLowerCase()]?.id;
      
      if (!providerId) {
        // Check if provider exists
        const existingProvider = Object.values(providerMap).find(p => 
          p.name.toLowerCase() === providerName.toLowerCase() || 
          p.slug.toLowerCase() === providerSlug
        );
        
        if (existingProvider) {
          providerId = existingProvider.id;
          providerMap[providerSlug] = existingProvider;
        } else {
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
          sort_order: sortOrder
        };
        
        const result = await httpRequest('/models', 'POST', modelData);
        const modelId = result?.[0]?.id || result?.id;
        modelSlugs.add(slug);
        
        // Insert price (delete existing first if needed)
        const pricing = model.pricing || {};
        const inputPrice = (parseFloat(pricing.prompt || 0)) * 1000000 * exchangeRate;
        const outputPrice = (parseFloat(pricing.completion || 0)) * 1000000 * exchangeRate;
        
        await deleteTodaysPrice(modelId);
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
        // Update sort_order for existing model
        const existingModel = existingModels.find(m => m.slug === slug);
        const modelId = existingModel?.id;
        
        if (modelId && existingModel?.sort_order !== sortOrder) {
          await httpRequest(`/models?id=eq.${modelId}`, 'PATCH', {
            sort_order: sortOrder
          });
        }
        
        // Check if price exists for today
        if (modelId && latestPrices[modelId]) {
          const pricing = model.pricing || {};
          const inputPrice = (parseFloat(pricing.prompt || 0)) * 1000000 * exchangeRate;
          const outputPrice = (parseFloat(pricing.completion || 0)) * 1000000 * exchangeRate;
          
          const oldInput = parseFloat(latestPrices[modelId].input_price_per_million || 0);
          const oldOutput = parseFloat(latestPrices[modelId].output_price_per_million || 0);
          
          if (Math.abs(oldInput - inputPrice) > 0.0001 || Math.abs(oldOutput - outputPrice) > 0.0001) {
            // Insert new price (delete existing first if needed)
            await deleteTodaysPrice(modelId);
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
      sortOrder++;
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
