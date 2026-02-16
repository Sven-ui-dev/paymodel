"use client";

import { useState } from "react";
import { getModels, CurrentPrice } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trophy, Check } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const [models, setModels] = useState<CurrentPrice[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load models for selection
  useState(() => {
    async function load() {
      try {
        const data = await getModels();
        setModels(data);
      } catch (error) {
        console.error("Error loading models:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  });

  const addToCompare = (modelId: string) => {
    if (!selectedIds.includes(modelId) && selectedIds.length < 3) {
      setSelectedIds([...selectedIds, modelId]);
    }
  };

  const removeFromCompare = (modelId: string) => {
    setSelectedIds(selectedIds.filter((id) => id !== modelId));
  };

  const selectedModels = models.filter((m) => selectedIds.includes(m.model_id));

  const getWinner = () => {
    if (selectedModels.length < 2) return null;
    return selectedModels.reduce((best, current) => {
      const bestScore = best.input_price_per_million + best.output_price_per_million;
      const currentScore = current.input_price_per_million + current.output_price_per_million;
      return currentScore < bestScore ? current : best;
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <p>Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Übersicht
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">🔄 Model-Vergleich</h1>

        {/* Model Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modelle auswählen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {models.slice(0, 8).map((model) => (
                <Button
                  key={model.model_id}
                  variant={selectedIds.includes(model.model_id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (selectedIds.includes(model.model_id)) {
                      removeFromCompare(model.model_id);
                    } else {
                      addToCompare(model.model_id);
                    }
                  }}
                  disabled={!selectedIds.includes(model.model_id) && selectedIds.length >= 3}
                >
                  {selectedIds.includes(model.model_id) && <Check className="w-4 h-4 mr-1" />}
                  {model.model_name}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Maximal 3 Modelle vergleichen
            </p>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedModels.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vergleich</span>
                {selectedModels.length >= 2 && (
                  <Badge variant="secondary">
                    {selectedModels.length} Modelle ausgewählt
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-4 border-b font-medium">Kriterium</th>
                      {selectedModels.map((model) => (
                        <th key={model.model_id} className="text-left p-4 border-b">
                          <div className="font-bold text-lg">{model.model_name}</div>
                          <Badge variant="outline" className="mt-1">
                            {model.provider_name}
                          </Badge>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-4 border-b font-medium">Input Preis</td>
                      {selectedModels.map((model) => (
                        <td key={model.model_id} className="p-4 border-b">
                          {formatPrice(model.input_price_per_million)} / 1M
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b font-medium">Output Preis</td>
                      {selectedModels.map((model) => (
                        <td key={model.model_id} className="p-4 border-b">
                          {formatPrice(model.output_price_per_million)} / 1M
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b font-medium">Context Window</td>
                      {selectedModels.map((model) => (
                        <td key={model.model_id} className="p-4 border-b">
                          {model.context_window >= 1000000
                            ? `${model.context_window / 1000000}M tokens`
                            : `${model.context_window / 1000}K tokens`}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b font-medium">Max Output</td>
                      {selectedModels.map((model) => (
                        <td key={model.model_id} className="p-4 border-b">
                          {model.max_output_tokens >= 1000
                            ? `${model.max_output_tokens / 1000}K tokens`
                            : `${model.max_output_tokens} tokens`}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b font-medium">Capabilities</td>
                      {selectedModels.map((model) => (
                        <td key={model.model_id} className="p-4 border-b">
                          <div className="flex flex-wrap gap-1">
                            {model.capabilities?.map((cap: string) => (
                              <Badge key={cap} variant="secondary">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 border-b"></td>
                      {selectedModels.map((model) => (
                        <td key={model.model_id} className="p-4 border-b">
                          <Button asChild size="sm">
                            <a href={model.affiliate_url} target="_blank" rel="noopener noreferrer">
                              Jetzt testen
                            </a>
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Winner Recommendation */}
              {selectedModels.length >= 2 && (
                <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-bold">Empfehlung</span>
                  </div>
                  <p>
                    Für deinen Use-Case empfehlen wir{" "}
                    <strong>{getWinner()?.model_name}</strong> von{" "}
                    <strong>{getWinner()?.provider_name}</strong> –{" "}
                    {getWinner()?.input_price_per_million === 0 &&
                    getWinner()?.output_price_per_million === 0
                      ? "kostenlos"
                      : "bestes Preis-Leistungs-Verhältnis"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Wähle mindestens 2 Modelle zum Vergleichen aus
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
