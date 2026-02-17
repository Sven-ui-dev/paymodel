"use client";

import { useState } from "react";
import { CurrentPrice } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heart, ExternalLink, Code, Brain, Eye, Globe, FileText } from "lucide-react";

interface ModelListProps {
  models: CurrentPrice[];
  onFavorite?: (modelId: string) => void;
  favorites?: string[];
}

const capabilityIcons: Record<string, React.ReactNode> = {
  text: <FileText className="w-4 h-4" />,
  coding: <Code className="w-4 h-4" />,
  reasoning: <Brain className="w-4 h-4" />,
  vision: <Eye className="w-4 h-4" />,
  translation: <Globe className="w-4 h-4" />,
};

const capabilityColors: Record<string, string> = {
  text: "bg-blue-100 text-blue-800",
  coding: "bg-purple-100 text-purple-800",
  reasoning: "bg-orange-100 text-orange-800",
  vision: "bg-green-100 text-green-800",
  translation: "bg-yellow-100 text-yellow-800",
};

export function ModelList({ models, onFavorite, favorites = [] }: ModelListProps) {
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free";
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${price.toFixed(2)}/M`;
  };

  const formatContext = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  if (models.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Keine Modelle gefunden</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Modelle ({models.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Modell</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Preis (Input/Output)</TableHead>
              <TableHead>Context</TableHead>
              <TableHead>Capabilities</TableHead>
              <TableHead className="w-[100px]">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => {
              const isFavorite = favorites.includes(model.model_id);
              return (
                <TableRow key={model.model_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{model.model_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {model.description?.slice(0, 60)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{model.provider_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>📥 {formatPrice(model.input_price_per_million, model.currency)}</p>
                      <p>📤 {formatPrice(model.output_price_per_million, model.currency)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatContext(model.context_window)} tokens
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {model.capabilities?.map((cap: string) => (
                        <span
                          key={cap}
                          className={`p-1 rounded ${capabilityColors[cap] || "bg-gray-100"}`}
                          title={cap}
                        >
                          {capabilityIcons[cap] || cap}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onFavorite?.(model.model_id)}
                        title={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten"}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Zum Provider"
                      >
                        <a href={model.affiliate_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
