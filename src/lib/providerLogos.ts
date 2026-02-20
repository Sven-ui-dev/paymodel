// Provider Logos - using inline SVGs for reliable display

// Generate SVG data URI for a provider
function createProviderSVG(name: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30"><rect width="100" height="30" rx="4" fill="${color}"/><text x="8" y="20" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="white">${name}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const providerLogos: Record<string, string> = {
  // Major AI Providers - using brand colors
  'openai': createProviderSVG('OpenAI', '#10A37F'),
  'anthropic': createProviderSVG('Anthropic', '#D97757'),
  'anthropic-claude': createProviderSVG('Claude', '#D97757'),
  'google': createProviderSVG('Google', '#4285F4'),
  'google-gemini': createProviderSVG('Gemini', '#4285F4'),
  'mistral': createProviderSVG('Mistral', '#FF7000'),
  'deepseek': createProviderSVG('DeepSeek', '#202020'),
  'groq': createProviderSVG('Groq', '#FF4B4B'),
  'xai': createProviderSVG('xAI', '#000000'),
  'meta': createProviderSVG('Meta', '#0668E1'),
  'meta-llama': createProviderSVG('Llama', '#0668E1'),
  'cohere': createProviderSVG('Cohere', '#000000'),
  'perplexity': createProviderSVG('Perplexity', '#6366F1'),
  
  // Cloud providers
  'aws-bedrock': createProviderSVG('AWS', '#FF9900'),
  'aws': createProviderSVG('AWS', '#FF9900'),
  'azure': createProviderSVG('Azure', '#0078D4'),
  
  // Chinese providers
  'minimax': createProviderSVG('Minimax', '#6B4EFF'),
  'z-ai': createProviderSVG('Z-ai', '#6B4EFF'),
  'moonshotai': createProviderSVG('Moonshot', '#000000'),
  'stepfun': createProviderSVG('StepFun', '#000000'),
  'baidu': createProviderSVG('Baidu', '#2932E1'),
  'bytedance': createProviderSVG('ByteDance', '#3DDC84'),
  'tongyi': createProviderSVG('Tongyi', '#2932E1'),
  'qwen': createProviderSVG('Qwen', '#2932E1'),
  
  // Other providers
  'arcee-ai': createProviderSVG('Arcee', '#6B4EFF'),
  'arcee': createProviderSVG('Arcee', '#6B4EFF'),
  'upstage': createProviderSVG('Upstage', '#000000'),
  'writer': createProviderSVG('Writer', '#000000'),
  'liquid-ai': createProviderSVG('Liquid', '#000000'),
  'liquid': createProviderSVG('Liquid', '#000000'),
  'allenai': createProviderSVG('AllenAI', '#000000'),
  'olmo': createProviderSVG('OLMo', '#000000'),
  'cerebras': createProviderSVG('Cerebras', '#000000'),
  'nvidia': createProviderSVG('NVIDIA', '#76B900'),
  'fireworks': createProviderSVG('Fireworks', '#000000'),
  'anyscale': createProviderSVG('Anyscale', '#000000'),
  'together': createProviderSVG('Together', '#000000'),
  'replicate': createProviderSVG('Replicate', '#000000'),
  'lepton': createProviderSVG('Lepton', '#000000'),
  'openrouter': createProviderSVG('OpenRouter', '#000000'),
  'novita': createProviderSVG('Novita', '#000000'),
  'hyperbolic': createProviderSVG('Hyperbolic', '#000000'),
  'deepinfra': createProviderSVG('DeepInfra', '#000000'),
  'sambanova': createProviderSVG('SambaNova', '#000000'),
};

// Export as plain object for runtime
export const providerLogosPlain: Record<string, string> = providerLogos;

export function getProviderLogo(providerSlug: string): string | null {
  // Try exact match
  if (providerLogos[providerSlug]) {
    return providerLogos[providerSlug];
  }
  
  // Try base slug (first part before dash)
  const baseSlug = providerSlug.split('-')[0];
  if (providerLogos[baseSlug]) {
    return providerLogos[baseSlug];
  }
  
  // Try partial match
  for (const key of Object.keys(providerLogos)) {
    if (providerSlug.includes(key) || key.includes(providerSlug)) {
      return providerLogos[key];
    }
  }
  
  return null;
}

export function getProviderColor(providerSlug: string): string {
  // Return null to indicate we should use the logo
  // The color is embedded in the SVG
  return 'transparent';
}
