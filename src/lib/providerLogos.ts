// Provider Logos - Official URLs

export const providerLogos: Record<string, string> = {
  // Major AI Providers - Official logo URLs
  'openai': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
  'anthropic': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_Logo.svg',
  'anthropic-claude': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_Logo.svg',
  'google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'google-gemini': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'mistral': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Mistral_Logo.svg',
  'deepseek': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/DeepSeek_Logo.svg/200px-DeepSeek_Logo.svg.png',
  'groq': 'https://groq.com/wp-content/uploads/2024/02/groq-logo.svg',
  'xai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Logo_of_X.svg/200px-Logo_of_X.svg.png',
  'meta': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  'meta-llama': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  'cohere': 'https://docs.cohere.com/docs/images/cohere-logo.svg',
  'perplexity': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Perplexity_AI_logo.svg',
  
  // Cloud providers
  'aws-bedrock': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  'aws': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  'azure': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Azure_logo.svg',
  
  // Chinese providers - using brand colors as fallback
  'minimax': 'https://minimax.io/favicon.ico',
  'z-ai': 'https://z-ai.cn/favicon.ico',
  'moonshotai': 'https://platform.moonshot.cn/favicon.ico',
  'stepfun': 'https://stepfun.com/favicon.ico',
  'baidu': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Baidu_%28website%29_logo.svg',
  'bytedance': 'https://upload.wikimedia.org/wikipedia/commons/6/67/ByteDance_logo.svg',
  'tongyi': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Baidu_%28website%29_logo.svg',
  'qwen': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Baidu_%28website%29_logo.svg',
  
  // Other providers
  'arcee-ai': 'https://arcee.ai/wp-content/uploads/2024/05/arcee-ai-logo.svg',
  'arcee': 'https://arcee.ai/wp-content/uploads/2024/05/arcee-ai-logo.svg',
  'upstage': 'https://www.upstage.ai/wp-content/uploads/2024/03/upstage-logo.svg',
  'writer': 'https://writer.com/wp-content/uploads/2023/10/writer-logo-dark.svg',
  'liquid-ai': 'https://liquid.ai/wp-content/uploads/2024/01/liquid-logo.svg',
  'liquid': 'https://liquid.ai/wp-content/uploads/2024/01/liquid-logo.svg',
  'allenai': 'https://allenai.org/olmo/assets/img/ai2-logo-full.svg',
  'olmo': 'https://allenai.org/olmo/assets/img/ai2-logo-full.svg',
  'cerebras': 'https://cerebras.net/wp-content/uploads/2023/09/cerebras_logo.svg',
  'nvidia': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Nvidia_logo.svg',
  'fireworks': 'https://fireworks.ai/assets/images/logo.svg',
  'anyscale': 'https://docs.anyscale.com/assets/logo-full.png',
  'together': 'https://together.ai/together-logo.svg',
  'replicate': 'https://replicate.com/replicate-logo.svg',
  'lepton': 'https://lepton.ai/assets/logo.svg',
  'openrouter': 'https://openrouter.ai/favicon.ico',
  'novita': 'https://novita.ai/favicon.ico',
  'hyperbolic': 'https://hyperbolic.ai/hyperbolic-logo.svg',
  'deepinfra': 'https://deepinfra.com/static/logo.svg',
  'sambanova': 'https://sambanova.ai/hubfs/sambanova-logo.svg',
};

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
  // Brand colors for fallback
  const colors: Record<string, string> = {
    'openai': '#10A37F',
    'anthropic': '#D97757',
    'google': '#4285F4',
    'mistral': '#FF7000',
    'deepseek': '#202020',
    'groq': '#FF4B4B',
    'xai': '#000000',
    'meta': '#0668E1',
    'cohere': '#000000',
    'perplexity': '#6366F1',
    'aws': '#FF9900',
    'azure': '#0078D4',
    'minimax': '#6B4EFF',
    'nvidia': '#76B900',
    'baidu': '#2932E1',
    'bytedance': '#3DDC84',
  };
  
  if (colors[providerSlug]) return colors[providerSlug];
  
  const baseSlug = providerSlug.split('-')[0];
  return colors[baseSlug] || '#2ECC71';
}
