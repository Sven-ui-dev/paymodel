/**
 * OpenRouter Price Updater
 * Fetches all models from OpenRouter and updates Supabase
 * 
 * Usage: node scripts/openrouter-updater.js
 * 
 * Cron (daily at 2 AM):
 * 0 2 * * * cd /path/to/paymodel-ai && node scripts/openrouter-updater.js
 */

const https = require('https');

// OpenRouter API - models endpoint (public, no auth needed)
const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';

// Supabase connection
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Provider name mapping for OpenRouter model IDs
const PROVIDER_MAP = {
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'google': 'Google',
  'deepseek': 'DeepSeek',
  'mistral': 'Mistral AI',
  'meta': 'Meta',
  'xai': 'xAI',
  'cohere': 'Cohere',
  'perplexity': 'Perplexity',
  'aws': 'AWS Bedrock',
  'bedrock': 'AWS Bedrock',
  'groq': 'Groq',
};

// Known providers for specific model patterns
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
  
  return 'OpenRouter';
}

// Parse OpenRouter pricing from pricing info
function extractPricing(pricing) {
  if (!pricing) return { input: 0, output: 0 };
  
  // OpenRouter pricing is in $/million tokens as string
  const inputPrice = parseFloat(pricing.prompt || '0');
  const outputPrice = parseFloat(pricing.completion || '0');
  
  return {
    input: inputPrice,
    output: outputPrice
  };
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

// Supabase helper functions
async function supabaseRequest(method, path, body = null) {
  const url = `${SUPABASE_URL}${path}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            reject(new Error(`Supabase error: ${res.statusCode}`));
          } else if (data) {
            resolve(JSON.parse(data));
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function getExistingProviders() {
  const result = await supabaseRequest('GET', '/rest/v1/providers?select=id,name,slug');
  const providers = {};
  result.forEach(p => {
    providers[p.slug.toLowerCase()] = p;
    providers[p.name.toLowerCase()] = p;
  });
  return providers;
}

async function getExistingModels() {
  const result = await supabaseRequest('GET', '/rest/v1/models?select=id,slug');
  return new Set(result.map(m => m.slug));
}

async function getLatestPrices() {
  const result = await supabaseRequest('GET', '/rest/v1/prices?select=model_id,input_price_per_million,output_price_per_million,effective_date&order=effective_date.desc.nullsfirst');
  const latestPrices = {};
  result.forEach(p => {
    if (!latestPrices[p.model_id]) {
      latestPrices[p.model_id] = p;
    }
  });
  return latestPrices;
}

async function upsertProvider(name, slug, websiteUrl = '', affiliateUrl = '') {
  const existing = await supabaseRequest('GET', `/rest/v1/providers?slug=eq.${slug}&select=id`);
  
  if (existing.length > 0) {
    await supabaseRequest('PATCH', `/rest/v1/providers?id=eq.${existing[0].id}`, {
      name,
      slug,
      website_url: websiteUrl,
      affiliate_url: affiliateUrl,
      is_active: true
    });
    return existing[0].id;
  } else {
    const result = await supabaseRequest('POST', '/rest/v1/providers', {
      name,
      slug,
      website_url: websiteUrl,
      affiliate_url: affiliateUrl,
      is_active: true,
      sort_order: 99
    });
    return result[0]?.id || result.id;
  }
}

async function upsertModel(providerId, name, slug, contextWindow, maxTokens, capabilities) {
  const existing = await supabaseRequest('GET', `/rest/v1/models?slug=eq.${slug}&select=id`);
  
  if (existing.length > 0) {
    await supabaseRequest('PATCH', `/rest/v1/models?id=eq.${existing[0].id}`, {
      provider_id: providerId,
      name,
      slug,
      context_window: contextWindow,
      max_output_tokens: maxTokens,
      capabilities,
      is_active: true
    });
    return existing[0].id;
  } else {
    const result = await supabaseRequest('POST', '/rest/v1/models', {
      provider_id: providerId,
      name,
      slug,
      context_window: contextWindow,
      max_output_tokens: maxTokens,
      capabilities,
      is_active: true,
      sort_order: 99
    });
    return result[0]?.id || result.id;
  }
}

async function insertPrice(modelId, inputPrice, outputPrice) {
  await supabaseRequest('POST', '/rest/v1/prices', {
    model_id: modelId,
    input_price_per_million: inputPrice,
    output_price_per_million: outputPrice,
    effective_date: new Date().toISOString().split('T')[0],
    currency: 'USD'
  });
}

// Main update function
async function updatePrices() {
  try {
    console.log('\n🚀 Starting OpenRouter price update...\n');
    
    // Fetch models from OpenRouter
    const openrouterModels = await fetchOpenRouterModels();
    
    // Get existing data
    const existingProviders = await getExistingProviders();
    const existingModelSlugs = await getExistingModels();
    const latestPrices = await getLatestPrices();
    
    console.log(`📊 Existing providers: ${Object.keys(existingProviders).length}`);
    console.log(`📊 Existing models: ${existingModelSlugs.size}`);
    
    let newModels = 0;
    let updatedPrices = 0;
    let skipped = 0;
    
    for (const model of openrouterModels) {
      const id = model.id;
      const name = model.id.split('/').pop() || model.id;
      const slug = model.id.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      
      // Extract capabilities from model capabilities
      const capabilities = model.capabilities || [];
      const capsArray = [];
      if (capabilities.includes('chat')) capsArray.push('text');
      if (capabilities.includes('vision') || capabilities.includes('image')) capsArray.push('vision');
      if (capabilities.includes('coding') || capabilities.includes('tools')) capsArray.push('coding');
      if (capabilities.includes('reasoning')) capsArray.push('reasoning');
      if (capabilities.length === 0) capsArray.push('text');
      
      // Extract context window
      const contextLength = model.context_length || model.max_tokens || 4096;
      const maxOutput = model.max_completion_tokens || model.max_tokens || 4096;
      
      // Extract pricing
      const pricing = extractPricing(model.pricing);
      
      // Detect provider
      const providerName = detectProvider(id);
      const providerSlug = providerName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Get or create provider
      let providerId;
      if (existingProviders[providerSlug] || existingProviders[providerName.toLowerCase()]) {
        providerId = existingProviders[providerSlug]?.id || existingProviders[providerName.toLowerCase()]?.id;
      } else {
        providerId = await upsertProvider(providerName, providerSlug);
        existingProviders[providerSlug] = { id: providerId, slug: providerSlug, name: providerName };
        console.log(`🆕 New provider: ${providerName}`);
      }
      
      // Check if model exists
      const modelExists = existingModelSlugs.has(slug);
      
      if (!modelExists) {
        // Create new model
        const modelId = await upsertModel(providerId, name, slug, contextLength, maxOutput, capsArray);
        existingModelSlugs.add(slug);
        
        // Insert new price
        await insertPrice(modelId, pricing.input, pricing.output);
        newModels++;
        console.log(`🆕 New model: ${name} (${providerName}) - $${pricing.input}/$ ${pricing.output}`);
      } else {
        // Get existing model ID
        const existingModel = await supabaseRequest('GET', `/rest/v1/models?slug=eq.${slug}&select=id`);
        const modelId = existingModel[0]?.id;
        
        if (modelId && latestPrices[modelId]) {
          const oldInput = parseFloat(latestPrices[modelId].input_price_per_million || 0);
          const oldOutput = parseFloat(latestPrices[modelId].output_price_per_million || 0);
          
          // Check if price changed
          const inputChanged = Math.abs(oldInput - pricing.input) > 0.001;
          const outputChanged = Math.abs(oldOutput - pricing.output) > 0.001;
          
          if (inputChanged || outputChanged) {
            await insertPrice(modelId, pricing.input, pricing.output);
            updatedPrices++;
            console.log(`💰 Price update: ${name} - Input: $${oldInput}→$${pricing.input}, Output: $${oldOutput}→$${pricing.output}`);
          } else {
            skipped++;
          }
        } else {
          skipped++;
        }
      }
    }
    
    console.log('\n✅ Update complete!');
    console.log(`   New models: ${newModels}`);
    console.log(`   Price updates: ${updatedPrices}`);
    console.log(`   Skipped: ${skipped}`);
    
    return {
      success: true,
      newModels,
      updatedPrices,
      skipped,
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
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { updatePrices, fetchOpenRouterModels };
