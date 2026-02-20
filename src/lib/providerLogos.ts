// Provider Logo & Color Mapping

export const providerLogos: Record<string, string> = {
  'openai': 'https://simpleicons.org/icons/openai.svg',
  'google': 'https://simpleicons.org/icons/google.svg',
  'meta': 'https://simpleicons.org/icons/meta.svg',
  'mistral': 'https://simpleicons.org/icons/mistral.svg',
  'nvidia': 'https://simpleicons.org/icons/nvidia.svg',
  'aws': 'https://simpleicons.org/icons/amazonaws.svg',
  'microsoft': 'https://simpleicons.org/icons/microsoft.svg',
};

// Brand colors for major AI providers
export const providerColors: Record<string, string> = {
  // Major providers
  'openai': '#10A37F',
  'anthropic': '#D97757',
  'anthropic-claude': '#D97757',
  'google': '#4285F4',
  'google-gemini': '#4285F4',
  'mistral': '#FF7000',
  'deepseek': '#202020',
  'groq': '#FF4B4B',
  'xai': '#000000',
  'meta': '#0668E1',
  'meta-llama': '#0668E1',
  'cohere': '#000000',
  'perplexity': '#6366F1',
  
  // Cloud providers
  'aws-bedrock': '#FF9900',
  'aws': '#FF9900',
  'azure': '#0078D4',
  
  // Chinese providers
  'minimax': '#6B4EFF',
  'z-ai': '#6B4EFF',
  'moonshotai': '#000000',
  'stepfun': '#000000',
  'baidu': '#2932E1',
  'bytedance': '#3DDC84',
  'tongyi': '#2932E1',
  
  // Other providers
  'arcee-ai': '#000000',
  'arcee': '#000000',
  'upstage': '#000000',
  'writer': '#000000',
  'liquid-ai': '#000000',
  'liquid': '#000000',
  'allenai': '#000000',
  'olmo': '#000000',
  'cerebras': '#000000',
  'kat': '#000000',
  'kat-ml': '#000000',
  'jamba': '#000000',
  'fireworks': '#000000',
  'anyscale': '#000000',
  'together': '#000000',
  'replicate': '#000000',
  'lepton': '#000000',
  'openrouter': '#000000',
  'novita': '#000000',
  'hyperbolic': '#000000',
  'qwen': '#000000',
  'deepinfra': '#000000',
  'sambanova': '#000000',
  'abacus': '#000000',
  'ai21': '#000000',
  'cohere': '#000000',
};

export function getProviderLogo(providerSlug: string): string | null {
  if (providerLogos[providerSlug]) {
    return providerLogos[providerSlug];
  }
  
  // Try base slug
  const baseSlug = providerSlug.split('-')[0];
  if (providerLogos[baseSlug]) {
    return providerLogos[baseSlug];
  }
  
  return null;
}

export function getProviderColor(providerSlug: string): string {
  if (providerColors[providerSlug]) {
    return providerColors[providerSlug];
  }
  
  const baseSlug = providerSlug.split('-')[0];
  if (providerColors[baseSlug]) {
    return providerColors[baseSlug];
  }
  
  // Check for partial matches
  for (const key of Object.keys(providerColors)) {
    if (providerSlug.includes(key) || key.includes(providerSlug)) {
      return providerColors[key];
    }
  }
  
  // Default to accent color
  return '#2ECC71';
}
