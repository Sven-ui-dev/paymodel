-- paymodel.ai Database Schema
-- Version: 1.0
-- Datum: 16. Februar 2026

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE price_change_type AS ENUM ('increase', 'decrease', 'new', 'removed');

-- ============================================================================
-- PROVIDERS: AI-Modell-Anbieter
-- ============================================================================

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    website_url VARCHAR(255),
    affiliate_url VARCHAR(500),
    api_base_url VARCHAR(255),
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_providers_active ON providers(is_active);

-- ============================================================================
-- MODELS: Verfügbare AI-Modelle
-- ============================================================================

CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    context_window INTEGER,
    max_output_tokens INTEGER,
    release_date DATE,
    description TEXT,
    capabilities JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_models_provider ON models(provider_id);
CREATE INDEX idx_models_active ON models(is_active);
CREATE INDEX idx_models_name ON models(name);
CREATE INDEX idx_models_search ON models USING gin(to_tsvector('german', name || ' ' || coalesce(description, '')));

-- ============================================================================
-- USE_CASES: Use-Case Kategorien
-- ============================================================================

CREATE TABLE use_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(100),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PRICES: Historische Preise (für Preistracking)
-- ============================================================================

CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    input_price_per_million DECIMAL(10, 4),
    output_price_per_million DECIMAL(10, 4),
    effective_date DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_estimated BOOLEAN DEFAULT false,
    source_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(model_id, effective_date)
);

CREATE INDEX idx_prices_model_date ON prices(model_id, effective_date DESC);

-- ============================================================================
-- MODEL_USE_CASES: Many-to-Many Beziehung
-- ============================================================================

CREATE TABLE model_use_cases (
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    use_case_id UUID REFERENCES use_cases(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    PRIMARY KEY (model_id, use_case_id)
);

-- ============================================================================
-- USERS: Benutzer (später für Accounts)
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    avatar_url VARCHAR(500),
    is_pro BOOLEAN DEFAULT false,
    stripe_customer_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER_FAVORITES: Gemerkte Modelle
-- ============================================================================

CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, model_id)
);

-- ============================================================================
-- PRICE_UPDATES: Preis-Änderungen Log
-- ============================================================================

CREATE TABLE price_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    change_type price_change_type,
    description TEXT,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- VIEWS (für einfache Queries)
-- ============================================================================

-- Aktuelle Preise aller Modelle
CREATE VIEW current_prices AS
SELECT 
    m.id as model_id,
    m.name as model_name,
    m.slug as model_slug,
    m.sort_order,
    p.id as provider_id,
    p.name as provider_name,
    p.slug as provider_slug,
    p.affiliate_url,
    pr.input_price_per_million,
    pr.output_price_per_million,
    pr.currency,
    m.context_window,
    m.max_output_tokens,
    m.capabilities
FROM models m
JOIN providers p ON m.provider_id = p.id
JOIN prices pr ON m.id = pr.model_id
WHERE m.is_active = true
    AND p.is_active = true
    AND pr.effective_date = (
        SELECT MAX(effective_date) 
        FROM prices 
        WHERE model_id = m.id
    );

-- Modelle mit Use-Cases
CREATE VIEW models_with_use_cases AS
SELECT 
    m.*,
    p.name as provider_name,
    p.slug as provider_slug,
    array_agg(json_build_object('id', uc.id, 'name', uc.name, 'slug', uc.slug, 'icon', uc.icon, 'is_primary', muc.is_primary)) as use_cases
FROM models m
JOIN providers p ON m.provider_id = p.id
LEFT JOIN model_use_cases muc ON m.id = muc.model_id
LEFT JOIN use_cases uc ON muc.use_case_id = uc.id
WHERE m.is_active = true
GROUP BY m.id, p.name, p.slug;
-- paymodel.ai Seed Data
-- Datum: 16. Februar 2026

-- ============================================================================
-- PROVIDERS
-- ============================================================================

INSERT INTO providers (id, name, slug, website_url, affiliate_url, logo_url, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'OpenAI', 'openai', 'https://openai.com', 'https://platform.openai.com/api/credits?referrer=paymodel', '/logos/openai.png', 1),
('22222222-2222-2222-2222-222222222222', 'Anthropic', 'anthropic', 'https://anthropic.com', 'https://console.anthropic.com/api/credits?ref=paymodel', '/logos/anthropic.png', 2),
('33333333-3333-3333-3333-333333333333', 'Google', 'google', 'https://google.com', 'https://console.cloud.google.com/billing?ref=paymodel', '/logos/google.png', 3),
('44444444-4444-4444-4444-444444444444', 'Mistral AI', 'mistral', 'https://mistral.ai', 'https://console.mistral.ai/api/credits?ref=paymodel', '/logos/mistral.png', 4),
('55555555-5555-5555-5555-555555555555', 'OpenRouter', 'openrouter', 'https://openrouter.ai', 'https://openrouter.ai/api/credits?ref=paymodel', '/logos/openrouter.png', 5),
('66666666-6666-6666-6666-666666666666', 'DeepSeek', 'deepseek', 'https://deepseek.com', 'https://platform.deepseek.com/api/credits?ref=paymodel', '/logos/deepseek.png', 6);

-- ============================================================================
-- USE CASES
-- ============================================================================

INSERT INTO use_cases (id, name, slug, icon, description, sort_order) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Text Generation', 'text-generation', '📝', 'General text writing and summarization', 1),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Coding', 'coding', '💻', 'Code generation, debugging, and programming', 2),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Vision', 'vision', '👁️', 'Image analysis and understanding', 3),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Reasoning', 'reasoning', '🧠', 'Complex reasoning and problem solving', 4),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Data Analysis', 'data-analysis', '📊', 'Data processing and analytics', 5),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Translation', 'translation', '🌐', 'Language translation and localization', 6);

-- ============================================================================
-- MODELS
-- ============================================================================

INSERT INTO models (id, provider_id, name, slug, context_window, max_output_tokens, release_date, description, capabilities, sort_order) VALUES

-- OpenAI Models
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'GPT-4o', 'gpt-4o', 128000, 4096, '2024-05-13', 'Flagship model for complex tasks with multimodal capabilities', '["text", "vision", "audio", "coding"]', 1),
('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'GPT-4o-mini', 'gpt-4o-mini', 128000, 4096, '2024-07-18', 'Cost-effective mini version of GPT-4o', '["text", "vision", "coding"]', 2),
('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'GPT-4 Turbo', 'gpt-4-turbo', 128000, 4096, '2023-11-06', 'Faster and cheaper than GPT-4', '["text", "vision", "coding"]', 3),
('a4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'GPT-3.5 Turbo', 'gpt-35-turbo', 16385, 4096, '2023-03-01', 'Fast and affordable for simple tasks', '["text", "coding"]', 4),

-- Anthropic Models
('b1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Claude 4.5 Sonnet', 'claude-4-5-sonnet', 200000, 8192, '2025-02-01', 'Latest Claude with enhanced reasoning', '["text", "vision", "coding", "reasoning"]', 1),
('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Claude 4.5 Haiku', 'claude-4-5-haiku', 200000, 4096, '2025-02-01', 'Fast and lightweight Claude', '["text", "vision", "coding"]', 2),
('b3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Claude 3.5 Sonnet', 'claude-3-5-sonnet', 200000, 4096, '2024-06-21', 'Previous generation with strong capabilities', '["text", "vision", "coding"]', 3),
('b4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Claude 3.5 Haiku', 'claude-3-5-haiku', 200000, 4096, '2024-06-21', 'Fast and responsive', '["text", "vision"]', 4),

-- Google Models
('c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Gemini 2.5 Pro', 'gemini-2-5-pro', 2000000, 32768, '2025-02-01', 'Latest Gemini with 2M context', '["text", "vision", "coding", "reasoning"]', 1),
('c2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Gemini 2.5 Flash', 'gemini-2-5-flash', 1000000, 16384, '2025-02-01', 'Fast Gemini for quick tasks', '["text", "vision", "coding"]', 2),
('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Gemini 1.5 Pro', 'gemini-1-5-pro', 2000000, 8192, '2024-02-15', 'Large context window model', '["text", "vision", "coding"]', 3),

-- Mistral Models
('d1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Mistral Large', 'mistral-large', 128000, 65536, '2024-07-29', 'Enterprise-grade model', '["text", "coding", "reasoning"]', 1),
('d2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Mistral Small', 'mistral-small', 128000, 4096, '2024-09-17', 'Efficient small model', '["text", "coding"]', 2),
('d3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Mistral Medium', 'mistral-medium', 128000, 4096, '2024-04-10', 'Balanced performance', '["text", "coding"]', 3),

-- DeepSeek Models
('e1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'DeepSeek V3', 'deepseek-v3', 128000, 65536, '2024-12-13', 'Powerful open-weight model', '["text", "coding", "reasoning"]', 1),
('e2222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'DeepSeek Coder', 'deepseek-coder', 128000, 4096, '2024-01-17', 'Specialized coding model', '["coding"]', 2),

-- OpenRouter Models
('f1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Qwen QwQ 32B', 'qwen-qwq-32b', 131072, 8192, '2025-01-30', 'Open-source reasoning model', '["text", "reasoning"]', 1),
('f2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'DeepSeek R1', 'deepseek-r1', 131072, 32768, '2025-01-20', 'Advanced reasoning model', '["text", "reasoning", "coding"]', 2);

-- ============================================================================
-- MODEL USE CASES (Many-to-Many)
-- ============================================================================

INSERT INTO model_use_cases (model_id, use_case_id, is_primary) VALUES

-- GPT-4o
('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),
('a1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', false),
('a1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', false),

-- GPT-4o-mini
('a2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true),

-- Claude 4.5 Sonnet
('b1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', true),
('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', false),

-- Gemini 2.5 Pro
('c1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', true),
('c1111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', false),

-- DeepSeek V3
('e1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', true),
('e1111111-1111-1111-1111-111111111111', 'dddddddd-dddd-dddd-dddd-dddddddddddd', false);

-- ============================================================================
-- PRICES (Aktuelle Preise - Stand: Feb 2026)
-- ============================================================================

INSERT INTO prices (model_id, input_price_per_million, output_price_per_million, effective_date, currency, source_url) VALUES

-- OpenAI Prices
('a1111111-1111-1111-1111-111111111111', 2.50, 10.00, '2026-02-01', 'USD', 'https://openai.com/pricing'),
('a2222222-2222-2222-2222-222222222222', 0.15, 0.60, '2026-02-01', 'USD', 'https://openai.com/pricing'),
('a3333333-3333-3333-3333-333333333333', 3.00, 15.00, '2026-02-01', 'USD', 'https://openai.com/pricing'),
('a4444444-4444-4444-4444-444444444444', 0.50, 1.50, '2026-02-01', 'USD', 'https://openai.com/pricing'),

-- Anthropic Prices
('b1111111-1111-1111-1111-111111111111', 3.00, 15.00, '2026-02-01', 'USD', 'https://anthropic.com/pricing'),
('b2222222-2222-2222-2222-222222222222', 0.25, 1.25, '2026-02-01', 'USD', 'https://anthropic.com/pricing'),
('b3333333-3333-3333-3333-333333333333', 3.00, 15.00, '2026-02-01', 'USD', 'https://anthropic.com/pricing'),
('b4444444-4444-4444-4444-444444444444', 0.20, 0.60, '2026-02-01', 'USD', 'https://anthropic.com/pricing'),

-- Google Prices (Gemini 2.5 ist kostenlos für Developer)
('c1111111-1111-1111-1111-111111111111', 0.00, 0.00, '2026-02-01', 'USD', 'https://ai.google.dev/pricing'),
('c2222222-2222-2222-2222-222222222222', 0.00, 0.00, '2026-02-01', 'USD', 'https://ai.google.dev/pricing'),
('c3333333-3333-3333-3333-333333333333', 1.25, 5.00, '2026-02-01', 'USD', 'https://ai.google.dev/pricing'),

-- Mistral Prices
('d1111111-1111-1111-1111-111111111111', 0.20, 0.60, '2026-02-01', 'USD', 'https://mistral.ai/pricing'),
('d2222222-2222-2222-2222-222222222222', 0.10, 0.10, '2026-02-01', 'USD', 'https://mistral.ai/pricing'),
('d3333333-3333-3333-3333-333333333333', 0.40, 1.40, '2026-02-01', 'USD', 'https://mistral.ai/pricing'),

-- DeepSeek Prices (sehr günstig)
('e1111111-1111-1111-1111-111111111111', 0.14, 0.28, '2026-02-01', 'USD', 'https://deepseek.com/pricing'),
('e2222222-2222-2222-2222-222222222222', 0.14, 0.28, '2026-02-01', 'USD', 'https://deepseek.com/pricing'),

-- OpenRouter Prices
('f1111111-1111-1111-1111-111111111111', 0.16, 0.16, '2026-02-01', 'USD', 'https://openrouter.ai/models'),
('f2222222-2222-2222-2222-222222222222', 0.14, 0.55, '2026-02-01', 'USD', 'https://openrouter.ai/models');

-- ============================================================================
-- COMPLETED
-- ============================================================================

SELECT 'Seed data inserted successfully!' as status;
-- API Keys Table for Business customers
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    usage_cost DECIMAL(10, 4) DEFAULT 0
);

-- Indexes
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- View for user API keys (without full key)
CREATE VIEW user_api_keys AS
SELECT 
    id,
    user_id,
    name,
    key_prefix || '************************' as masked_key,
    is_active,
    last_used_at,
    created_at,
    expires_at,
    usage_count,
    usage_cost
FROM api_keys;

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys" ON api_keys
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON api_keys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON api_keys
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON api_keys
    FOR UPDATE
    USING (auth.uid() = user_id);
