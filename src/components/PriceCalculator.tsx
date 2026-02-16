"use client";

import { useState, useMemo } from "react";
import { CurrentPrice } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PriceCalculatorProps {
  models: CurrentPrice[];
}

export function PriceCalculator({ models }: PriceCalculatorProps) {
  const [inputTokens, setInputTokens] = useState<string>("100000");
  const [outputTokens, setOutputTokens] = useState<string>("50000");

  const inputTokenCount = parseInt(inputTokens) || 0;
  const outputTokenCount = parseInt(outputTokens) || 0;

  const calculations = useMemo(() => {
    return models
      .map((model) => {
        const inputCost = (inputTokenCount / 1000000) * model.input_price_per_million;
        const outputCost = (outputTokenCount / 1000000) * model.output_price_per_million;
        const totalCost = inputCost + outputCost;

        return {
          ...model,
          inputCost,
          outputCost,
          totalCost,
        };
      })
      .sort((a, b) => a.totalCost - b.totalCost);
  }, [models, inputTokenCount, outputTokenCount]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const getCheapest = () => {
    return calculations.find((c) => c.totalCost > 0);
  };

  const freeModels = calculations.filter((c) => c.totalCost === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Token-Rechner</CardTitle>
        <CardDescription>
          Berechne die Kosten für deinen Use-Case
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input Tokens</label>
            <Input
              type="number"
              value={inputTokens}
              onChange={(e) => setInputTokens(e.target.value)}
              placeholder="100000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Output Tokens</label>
            <Input
              type="number"
              value={outputTokens}
              onChange={(e) => setOutputTokens(e.target.value)}
              placeholder="50000"
            />
          </div>
        </div>

        <Separator />

        {/* Results */}
        {freeModels.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="font-medium text-green-800">
              🌟 Kostenlose Optionen gefunden!
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {freeModels.map((model) => (
                <Badge key={model.model_id} variant="secondary" className="bg-green-100">
                  {model.model_name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Price List */}
        <div className="space-y-3">
          {calculations.slice(0, 10).map((model, index) => (
            <div
              key={model.model_id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0 && model.totalCost > 0
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{model.model_name}</p>
                  <p className="text-xs text-muted-foreground">{model.provider_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(model.totalCost)}</p>
                {index === 0 && model.totalCost > 0 && (
                  <Badge variant="default" className="text-xs">
                    🥇 Günstigst
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {inputTokenCount > 0 && outputTokenCount > 0 && (
          <div className="p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Gesamt: {inputTokenCount.toLocaleString()} Input +{" "}
              {outputTokenCount.toLocaleString()} Output Tokens
            </p>
            {getCheapest() && (
              <p className="text-sm mt-1">
                💡 Empfehlung: <strong>{getCheapest()?.model_name}</strong> für{" "}
                <strong>{formatCurrency(getCheapest()?.totalCost || 0)}</strong>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
