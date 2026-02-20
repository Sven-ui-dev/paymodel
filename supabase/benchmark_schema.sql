-- Benchmark Results Table
CREATE TABLE benchmark_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prompt TEXT NOT NULL,
    model_slug VARCHAR(255) NOT NULL,
    provider_slug VARCHAR(255) NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    input_cost DECIMAL(10, 6),
    output_cost DECIMAL(10, 6),
    total_cost DECIMAL(10, 6),
    response_text TEXT,
    response_time_ms INTEGER,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_benchmark_results_user ON benchmark_results(user_id);
CREATE INDEX idx_benchmark_results_created ON benchmark_results(created_at DESC);

-- RLS Policies
ALTER TABLE benchmark_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own benchmark results" ON benchmark_results
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own benchmark results" ON benchmark_results
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own benchmark results" ON benchmark_results
    FOR DELETE
    USING (auth.uid() = user_id);
