"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, Play, CheckCircle, Loader2 } from "lucide-react";
import type { CurrentPrice } from "@/lib/supabase";

interface BenchmarkToolProps {
  models: CurrentPrice[];
}

export function BenchmarkTool({ models }: BenchmarkToolProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    modelId: string;
    estimatedTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
  }[] | null>(null);

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
    setResults(null);
  };

  const runBenchmark = () => {
    if (!prompt.trim() || selectedModels.length === 0) return;

    setIsRunning(true);
    setResults(null);

    // Simulate API call
    setTimeout(() => {
      const estimatedInputTokens = Math.ceil(prompt.length / 4); // Rough estimate: 4 chars per token
      const estimatedOutputTokens = Math.ceil(estimatedInputTokens * 0.75); // Output typically 75% of input

      const benchmarkResults = selectedModels.map((modelId) => {
        const model = models.find((m) => m.model_id === modelId);
        if (!model) return null;

        const inputCost = (estimatedInputTokens / 1000000) * model.input_price_per_million;
        const outputCost = (estimatedOutputTokens / 1000000) * model.output_price_per_million;

        return {
          modelId,
          estimatedTokens: estimatedInputTokens + estimatedOutputTokens,
          inputCost,
          outputCost,
          totalCost: inputCost + outputCost,
        };
      }).filter(Boolean);

      setResults(benchmarkResults as any);
      setIsRunning(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Prompt-Benchmark
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label htmlFor="prompt">Dein Prompt</Label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Gib hier deinen Prompt ein..."
            className="w-full min-h-[120px] p-3 border rounded-lg bg-background resize-none"
          />
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
                Alle
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
        <Button
          onClick={runBenchmark}
          disabled={!prompt.trim() || selectedModels.length === 0 || isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Berechne...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Benchmark starten
            </>
          )}
        </Button>

        {/* Results */}
        {results && results.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Ergebnisse</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results
                .sort((a, b) => a.totalCost - b.totalCost)
                .map((result) => {
                  const model = models.find((m) => m.model_id === result.modelId);
                  if (!model) return null;

                  return (
                    <div
                      key={result.modelId}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{model.model_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.estimatedTokens.toLocaleString()} Tokens
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          €{result.totalCost.toFixed(4)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ({model.currency})
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
