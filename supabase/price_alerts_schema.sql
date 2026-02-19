-- ============================================================================
-- PRICE ALERTS: Preis-Warnungen für Modelle
-- ============================================================================

CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE NOT NULL,
    target_price DECIMAL(10, 4) NOT NULL,
    current_price DECIMAL(10, 4),
    is_active BOOLEAN DEFAULT true,
    is_triggered BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_model ON price_alerts(model_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_price_alerts_triggered ON price_alerts(is_triggered) WHERE is_triggered = false;

-- Eindeutiger Alert pro User/Modell
CREATE UNIQUE INDEX idx_price_alerts_user_model ON price_alerts(user_id, model_id) WHERE is_active = true;

-- View für aktive Alerts mit Modell-Details
CREATE VIEW active_price_alerts AS
SELECT 
    pa.id as alert_id,
    pa.user_id,
    pa.model_id,
    pa.target_price,
    pa.current_price,
    pa.is_active,
    pa.is_triggered,
    pa.created_at,
    pa.triggered_at,
    m.name as model_name,
    m.slug as model_slug,
    p.name as provider_name,
    p.slug as provider_slug
FROM price_alerts pa
JOIN models m ON pa.model_id = m.id
JOIN providers p ON m.provider_id = p.id
WHERE pa.is_active = true;
