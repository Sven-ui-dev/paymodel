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
