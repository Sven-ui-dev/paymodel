"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Play, CheckCircle, Loader2, Upload, Trash2, Clock, DollarSign, Zap, AlertCircle } from "lucide-react";
import type { CurrentPrice } from "@/lib/supabase";

interface BenchmarkResult {
  id?: string;
  model_name: string;
  model_slug: string;
  provider_name: string;
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  response_text?: string;
  response_time_ms?: number;
  error?: string;
  created_at?: string;
}

interface BenchmarkToolProps {
  models: CurrentPrice[];
}

export function BenchmarkTool({ models }: BenchmarkToolProps) {
  const [prompt, setPrompt] = useState("");
  const [multiPrompts, setMultiPrompts] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<BenchmarkResult[]>([]);
  const [useMultiPrompt, setUseMultiPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const selectAll = () => {
    setSelectedModels(models.slice(0, 10).map((m) => m.model_id));
  };

  const clearAll = () => {
    setSelectedModels([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.csv')) {
        // CSV: first column is prompt
        const lines = content.split('\n').filter(l => l.trim());
        const prompts = lines.slice(1).map(line => line.split(',')[0].replace(/"/g, ''));
        setMultiPrompts(prompts.filter(p => p.trim()));
      } else {
        // TXT: one prompt per line
        setMultiPrompts(content.split('\n').filter(p => p.trim()));
      }
    };
    reader.readAsText(file);
  };

  const runBenchmark = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return;

    setIsRunning(true);
    setResults([]);

    const promptsToTest = useMultiPrompt && multiPrompts.length > 0 ? multiPrompts : [prompt];
    const allResults: BenchmarkResult[] = [];

    // Get auth token
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    for (const testPrompt of promptsToTest) {
      const estimatedInputTokens = Math.ceil(testPrompt.length / 4);
      const estimatedOutputTokens = Math.ceil(estimatedInputTokens * 0.5);

      for (const modelId of selectedModels) {
        const model = models.find((m) => m.model_id === modelId);
        if (!model) continue;

        const inputCost = (estimatedInputTokens / 1000000) * model.input_price_per_million;
        const outputCost = (estimatedOutputTokens / 1000000) * model.output_price_per_million;

        // Simulate API call with estimated results
        const startTime = Date.now();
        
        // In production, this would make actual API calls
        // For now, we simulate and store in history
        const result: BenchmarkResult = {
          model_name: model.model_name,
          model_slug: model.model_slug,
          provider_name: model.provider_name,
          input_tokens: estimatedInputTokens,
          output_tokens: estimatedOutputTokens,
          input_cost: inputCost,
          output_cost: outputCost,
          total_cost: inputCost + outputCost,
          response_text: useMultiPrompt ? undefined : `Simulated response for: "${testPrompt.substring(0, 50)}..."`,
          response_time_ms: Math.floor(Math.random() * 3000) + 500,
          created_at: new Date().toISOString(),
        };

        allResults.push(result);

        // Save to history in database
        if (token) {
          await fetch('/api/benchmark/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              prompt: testPrompt,
              ...result,
            }),
          });
        }

        setResults([...allResults]);
      }
    }

    setIsRunning(false);
    loadHistory();
  };

  const loadHistory = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    try {
      const response = await fetch('/api/benchmark/history', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    await fetch(`/api/benchmark/history/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    loadHistory();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: '#2ECC71' }} />
          Personalisierter Benchmark
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={!useMultiPrompt ? "default" : "outline"}
            size="sm"
            onClick={() => setUseMultiPrompt(false)}
          >
            Einzelner Prompt
          </Button>
          <Button
            variant={useMultiPrompt ? "default" : "outline"}
            size="sm"
            onClick={() => setUseMultiPrompt(true)}
          >
            Mehrere Prompts (CSV/TXT)
          </Button>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt">
            {useMultiPrompt ? "Mehrere Prompts" : "Dein Prompt"}
          </Label>
          
          {useMultiPrompt ? (
            <>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Datei hochladen (CSV/TXT)
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {multiPrompts.length > 0 && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">{multiPrompts.length} Prompts geladen:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {multiPrompts.slice(0, 5).map((p, i) => (
                      <p key={i} className="text-xs text-muted-foreground truncate">{i+1}. {p}</p>
                    ))}
                    {multiPrompts.length > 5 && (
                      <p className="text-xs text-muted-foreground">...und {multiPrompts.length - 5} mehr</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Gib hier deinen Prompt ein..."
              className="min-h-[120px]"
            />
          )}
          <p className="text-xs text-muted-foreground">
            Geschätzte Tokens: {prompt.trim() ? Math.ceil(prompt.length / 4) : 0}
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Modelle auswählen ({selectedModels.length})</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Top 10
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Keine
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-muted/50">
            {models.slice(0, 20).map((model) => (
              <button
                key={model.model_id}
                onClick={() => toggleModel(model.model_id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedModels.includes(model.model_id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border hover:bg-muted"
                }`}
              >
                {model.model_name}
              </button>
            ))}
          </div>
        </div>

        {/* Run Button */}
        <div className="flex gap-2">
          <Button
            onClick={runBenchmark}
            disabled={(!prompt.trim() && multiPrompts.length === 0) || selectedModels.length === 0 || isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Benchmark läuft...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Benchmark starten
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}>
            <Clock className="w-4 h-4" />
          </Button>
        </div>

        {/* History */}
        {showHistory && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Verlauf</h4>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch kein Verlauf</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.slice(0, 20).map((item, i) => (
                  <div key={item.id || i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{item.model_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.input_tokens + item.output_tokens} Tokens • €{item.total_cost?.toFixed(4)}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => item.id && deleteHistoryItem(item.id)}>
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results && results.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold">
              Ergebnisse {useMultiPrompt && multiPrompts.length > 0 && `(${results.length / selectedModels.length} Prompts)`}
            </h4>
            
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Durchschn. Kosten</p>
                <p className="font-semibold text-lg" style={{ color: '#2ECC71' }}>
                  €{(results.reduce((a, b) => a + b.total_cost, 0) / results.length).toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gesamt Tokens</p>
                <p className="font-semibold text-lg">
                  {results.reduce((a, b) => a + b.input_tokens + b.output_tokens, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Schnellste</p>
                <p className="font-semibold text-lg">
                  {Math.min(...results.map(r => r.response_time_ms || 0))}ms
                </p>
              </div>
            </div>

            {/* Detailed Results */}
            {!useMultiPrompt && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results
                  .sort((a, b) => a.total_cost - b.total_cost)
                  .map((result, i) => (
                    <div key={i} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{result.model_name}</p>
                          <p className="text-xs text-muted-foreground">{result.provider_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold" style={{ color: '#2ECC71' }}>
                            €{result.total_cost.toFixed(4)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {result.response_time_ms}ms
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                        <span>In: {result.input_tokens} Tokens</span>
                        <span>Out: {result.output_tokens} Tokens</span>
                      </div>
                      {result.response_text && (
                        <div className="p-2 bg-muted rounded text-xs font-mono max-h-24 overflow-y-auto">
                          {result.response_text}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
