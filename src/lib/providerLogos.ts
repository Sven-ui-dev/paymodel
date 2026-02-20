// Provider Logo Mapping
// Using clearbit logo API and manual fallbacks

export const providerLogos: Record<string, string> = {
  'openai': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
  'anthropic': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_Logo.svg',
  'google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'mistral': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Mistral_Logo.svg',
  'deepseek': 'https://deepseek.com/favicon.ico',
  'groq': 'https://groq.com/favicon.ico',
  'xai': 'https://x.ai/favicon.ico',
  'meta': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  'cohere': 'https://cohere.com/favicon.ico',
  'perplexity': 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Perplexity_AI_logo.svg',
  'aws-bedrock': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
  'openrouter': 'https://openrouter.ai/favicon.ico',
  'minimax': 'https://www.minimaxi.cn/favicon.ico',
  'z-ai': 'https://z-ai.cn/favicon.ico',
  'moonshotai': 'https://moonshot.cn/favicon.ico',
  'stepfun': 'https://stepfun.com/favicon.ico',
  'arcee-ai': 'https://arcee.ai/favicon.ico',
  'upstage': 'https://upstage.ai/favicon.ico',
  'writer': 'https://writer.com/favicon.ico',
  'liquid-ai': 'https://liquid.ai/favicon.ico',
  'allenai': 'https://allenai.org/favicon.ico',
  'nvidia': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Nvidia_logo.svg',
  'baidu': 'https://upload.wikimedia.org/wikipedia/commons/0/09/Baidu_%28website%29_logo.svg',
  'bytedance': 'https://upload.wikimedia.org/wikipedia/commons/6/67/ByteDance_logo.svg',
};

// Fallback color for providers without logos
export const providerColors: Record<string, string> = {
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
  'aws-bedrock': '#FF9900',
  'openrouter': '#000000',
  'minimax': '#000000',
  'z-ai': '#000000',
  'moonshotai': '#000000',
  'stepfun': '#000000',
  'arcee-ai': '#000000',
  'upstage': '#000000',
  'writer': '#000000',
  'liquid-ai': '#000000',
  'allenai': '#000000',
  'nvidia': '#76B900',
  'baidu': '#2932E1',
  'bytedance': '#3DDC84',
};

export function getProviderLogo(providerSlug: string): string | null {
  return providerLogos[providerSlug] || null;
}

export function getProviderColor(providerSlug: string): string {
  return providerColors[providerSlug] || '#2ECC71';
}
