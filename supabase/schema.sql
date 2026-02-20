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
