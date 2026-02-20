import { createClient } from '@supabase/supabase-js';

// Environment variables für Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types für die Datenbank
export type Provider = {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  affiliate_url: string;
  logo_url: string;
  is_active: boolean;
  sort_order: number;
};

export type Model = {
  id: string;
  provider_id: string;
  name: string;
  slug: string;
  context_window: number;
  max_output_tokens: number;
  release_date: string;
  description: string;
  capabilities: string[];
  is_active: boolean;
  sort_order: number;
  provider?: Provider;
};

export type Price = {
  id: string;
  model_id: string;
  input_price_per_million: number;
  output_price_per_million: number;
  effective_date: string;
  currency: string;
};

export type UseCase = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
};

export type ModelWithPrice = Model & {
  provider: Provider;
  prices: Price;
  use_cases?: UseCase[];
};

export type CurrentPrice = {
  model_id: string;
  model_name: string;
  model_slug: string;
  sort_order: number;
  provider_id: string;
  provider_name: string;
  provider_slug: string;
  affiliate_url: string;
  input_price_per_million: number;
  output_price_per_million: number;
  currency: string;
  context_window: number;
  max_output_tokens: number;
  capabilities: string[];
};

export type PriceAlert = {
  id: string;
  user_id: string;
  model_id: string;
  target_price: number;
  current_price: number | null;
  is_active: boolean;
  is_triggered: boolean;
  created_at: string;
  triggered_at: string | null;
};

export type PriceAlertWithDetails = PriceAlert & {
  model_name: string;
  model_slug: string;
  provider_name: string;
  provider_slug: string;
};

// API Functions
export async function getProviders() {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  
  if (error) throw error;
  return data;
}

export async function getModels(filters?: { providerSlug?: string; useCaseSlug?: string; search?: string }) {
  let query = supabase
    .from('current_prices')
    .select('*')
    .order('sort_order', { ascending: true });

  if (filters?.providerSlug) {
    query = query.eq('provider_slug', filters.providerSlug);
  }

  if (filters?.search) {
    query = query.ilike('model_name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as CurrentPrice[];
}

export async function getModelBySlug(slug: string) {
  const { data, error } = await supabase
    .from('current_prices')
    .select('*')
    .eq('model_slug', slug)
    .single();
  
  if (error) throw error;
  return data as CurrentPrice;
}

export async function getUseCases() {
  const { data, error } = await supabase
    .from('use_cases')
    .select('*')
    .order('sort_order');
  
  if (error) throw error;
  return data;
}
