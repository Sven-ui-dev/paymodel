// Provider Logos - Official URLs

export const providerLogos: Record<string, string> = {
  // Major AI Providers - Official logo URLs
  'openai': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/openai.svg',
  'anthropic': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/anthropic.svg',
  'anthropic-claude': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/anthropic.svg',
  'google': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/google.svg',
  'google-gemini': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/googlecloud.svg',
  'mistral': 'https://docs.mistral.ai/img/logo.svg',
  'deepseek': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/deepseek.svg',
  'groq': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/groq.svg',
  'xai': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/x.svg',
  'meta': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/meta.svg',
  'meta-llama': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/meta.svg',
  'cohere': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/cohere.svg',
  'perplexity': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/perplexity.svg',
  
  // Cloud providers
  'aws-bedrock': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/amazonaws.svg',
  'aws': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/amazonaws.svg',
  'azure': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/microsoftazure.svg',
  
  // Chinese providers - using brand colors as fallback
  'minimax': 'https://minimax.io/favicon.ico',
  'z-ai': 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%235565FF"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  'moonshotai': 'https://platform.moonshot.cn/favicon.ico',
  'stepfun': 'https://stepfun.com/favicon.ico',
  'baidu': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/baidu.svg',
  'bytedance': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/bytedance.svg',
  'tongyi': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/baidu.svg',
  'qwen': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/baidu.svg',
  
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
  'nvidia': 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/nvidia.svg',
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
