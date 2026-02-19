"use client";

import { useState, useMemo } from "react";
import { CurrentPrice } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Code, Brain, Eye, Globe, FileText, Mic } from "lucide-react";

interface PriceCalculatorProps {
  models: CurrentPrice[];
}

const capabilityIcons: Record<string, React.ReactNode> = {
  text: <FileText className="w-3 h-3" />,
  coding: <Code className="w-3 h-3" />,
  reasoning: <Brain className="w-3 h-3" />,
  vision: <Eye className="w-3 h-3" />,
  translation: <Globe className="w-3 h-3" />,
  audio: <Mic className="w-3 h-3" />,
};

const capabilityColors: Record<string, string> = {
  text: "bg-blue-100 text-blue-800 border-blue-200",
  coding: "bg-purple-100 text-purple-800 border-purple-200",
  reasoning: "bg-orange-100 text-orange-800 border-orange-200",
  vision: "bg-green-100 text-green-800 border-green-200",
  translation: "bg-yellow-100 text-yellow-800 border-yellow-200",
  audio: "bg-pink-100 text-pink-800 border-pink-200",
};

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
      currency: "EUR",
    }).format(value);
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
                <Badge key={model.model_id} variant="secondary" className="bg-green-100 flex items-center gap-1">
                  <span>{model.model_name}</span>
                  {model.capabilities && model.capabilities.length > 0 && (
                    <div className="flex gap-0.5">
                      {model.capabilities.slice(0, 2).map((cap) => (
                        <span
                          key={cap}
                          className={`inline-flex items-center px-1 rounded text-[10px] ${capabilityColors[cap] || 'bg-gray-200'}`}
                        >
                          {capabilityIcons[cap]}
                        </span>
                      ))}
                    </div>
                  )}
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
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{model.model_name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-muted-foreground">{model.provider_name}</p>
                    {/* Capabilities */}
                    {model.capabilities && model.capabilities.length > 0 && (
                      <div className="flex gap-1">
                        {model.capabilities.slice(0, 3).map((cap) => (
                          <span
                            key={cap}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border ${capabilityColors[cap] || 'bg-gray-100 text-gray-800'}`}
                            title={cap}
                          >
                            {capabilityIcons[cap]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
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
              Gesamt: {formatNumber(inputTokenCount)} Input +{" "}
              {formatNumber(outputTokenCount)} Output Tokens
            </p>
            {(() => {
              const cheapest = getCheapest();
              if (!cheapest) return null;
              return (
                <p className="text-sm mt-1">
                  💡 Empfehlung: <strong>{cheapest.model_name}</strong> für{" "}
                  <strong>{formatCurrency(cheapest.totalCost)}</strong>
                  {cheapest.capabilities && cheapest.capabilities.length > 0 && (
                    <span className="ml-2 flex gap-1 inline-flex">
                      {cheapest.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs border ${capabilityColors[cap] || 'bg-gray-100'}`}
                        >
                          {capabilityIcons[cap]}
                        </span>
                      ))}
                    </span>
                  )}
                </p>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
