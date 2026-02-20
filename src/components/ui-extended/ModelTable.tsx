"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, StarOff, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CurrentPrice {
  model_id: number;
  model_name: string;
  provider_name: string;
  provider_slug: string;
  input_price_per_million: number;
  output_price_per_million: number;
  context_window: number;
  capabilities: string[];
  affiliate_url?: string;
}

interface ModelTableProps {
  models: CurrentPrice[];
  favorites: string[];
  onFavorite: (modelId: string) => void;
  compact?: boolean;
}

export function ModelTable({ models, favorites, onFavorite, compact = false }: ModelTableProps) {
  const [sortField, setSortField] = useState<keyof CurrentPrice>("input_price_per_million");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: keyof CurrentPrice) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedModels = [...models].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc" 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    
    return 0;
  });

  // Mobile card view
  const MobileCardView = ({ model }: { model: CurrentPrice }) => (
    <div className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{model.model_name}</h4>
          <Badge variant="outline" className="mt-1 text-xs">
            {model.provider_name}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFavorite(String(model.model_id))}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label={favorites.includes(String(model.model_id)) ? "Remove from favorites" : "Add to favorites"}
          >
            {favorites.includes(String(model.model_id)) ? (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            ) : (
              <StarOff className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <Button variant="ghost" size="icon" asChild>
            <a href={model.affiliate_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Input</span>
          <p className="font-medium">€{model.input_price_per_million.toFixed(2)}/M</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Output</span>
          <p className="font-medium">€{model.output_price_per_million.toFixed(2)}/M</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Kontext</span>
          <p className="font-medium">
            {model.context_window >= 1000000 
              ? `${(model.context_window / 1000000).toFixed(0)}M`
              : `${(model.context_window / 1000).toFixed(0)}K`}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Features</span>
          <div className="flex gap-1 flex-wrap mt-1">
            {model.capabilities?.slice(0, 2).map((cap) => (
              <Badge key={cap} variant="secondary" className="text-xs px-1.5 py-0">
                {cap}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-3">
        {sortedModels.slice(0, 10).map((model) => (
          <MobileCardView key={model.model_id} model={model} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {sortedModels.slice(0, 20).map((model) => (
          <MobileCardView key={model.model_id} model={model} />
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium w-10"></th>
              <th 
                className="text-left p-3 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort("model_name")}
              >
                <div className="flex items-center gap-1">
                  Modell
                  {sortField === "model_name" && (
                    sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </th>
              <th className="text-left p-3 font-medium">Provider</th>
              <th 
                className="text-right p-3 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort("input_price_per_million")}
              >
                <div className="flex items-center justify-end gap-1">
                  Input / 1M
                  {sortField === "input_price_per_million" && (
                    sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </th>
              <th 
                className="text-right p-3 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort("output_price_per_million")}
              >
                <div className="flex items-center justify-end gap-1">
                  Output / 1M
                  {sortField === "output_price_per_million" && (
                    sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </th>
              <th 
                className="text-right p-3 font-medium cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSort("context_window")}
              >
                <div className="flex items-center justify-end gap-1">
                  Kontext
                  {sortField === "context_window" && (
                    sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Features</th>
              <th className="text-right p-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sortedModels.slice(0, 50).map((model) => (
              <tr key={model.model_id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <button
                    onClick={() => onFavorite(String(model.model_id))}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label={favorites.includes(String(model.model_id)) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favorites.includes(String(model.model_id)) ? (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <StarOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </td>
                <td className="p-3 font-medium">{model.model_name}</td>
                <td className="p-3">
                  <Badge variant="outline">{model.provider_name}</Badge>
                </td>
                <td className="p-3 text-right font-medium">
                  €{model.input_price_per_million.toFixed(2)}
                </td>
                <td className="p-3 text-right font-medium">
                  €{model.output_price_per_million.toFixed(2)}
                </td>
                <td className="p-3 text-right text-muted-foreground">
                  {model.context_window >= 1000000 
                    ? `${(model.context_window / 1000000).toFixed(0)}M`
                    : `${(model.context_window / 1000).toFixed(0)}K`}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {model.capabilities?.slice(0, 3).map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={model.affiliate_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
