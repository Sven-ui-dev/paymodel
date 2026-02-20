"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, StarOff, ChevronDown, ChevronUp, Bell } from "lucide-react";
import type { CurrentPrice } from "@/lib/supabase";
import { CreatePriceAlertModal } from "@/components/CreatePriceAlertModal";
import { getProviderLogo, getProviderColor } from "@/lib/providerLogos";

interface ModelTableProps {
  models: CurrentPrice[];
  favorites: string[];
  onFavorite: (modelId: string) => void;
  compact?: boolean;
  userId?: string;
}

export function ModelTable(props: ModelTableProps) {
  return <ModelTableWithModal {...props} />;
}

function ModelTableWithModal({ models, favorites, onFavorite, compact = false, userId }: ModelTableProps) {
  const [sortField, setSortField] = useState<keyof CurrentPrice>("sort_order");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedModel, setSelectedModel] = useState<CurrentPrice | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const handleSort = (field: keyof CurrentPrice) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedModels = [...models].sort((a, b) => {
    const aVal = a[sortField as keyof CurrentPrice];
    const bVal = b[sortField as keyof CurrentPrice];
    
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

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return `€${price.toFixed(2)}/M`;
  };

  const formatContext = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  const capabilityColors: Record<string, string> = {
    text: "bg-blue-100 text-blue-800 border-blue-300",
    coding: "bg-purple-100 text-purple-800 border-purple-300",
    reasoning: "bg-orange-100 text-orange-800 border-orange-300",
    vision: "bg-green-100 text-green-800 border-green-300",
  };

  const MobileCardView = ({ model }: { model: CurrentPrice }) => (
    <div className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold truncate">{model.model_name}</h4>
          <div className="flex items-center gap-1.5 mt-1">
            {model.provider_slug && (
              <img 
                src={getProviderLogo(model.provider_slug) || ''} 
                alt={model.provider_name}
                className="w-4 h-4 rounded"
                style={{ 
                  backgroundColor: getProviderColor(model.provider_slug),
                  display: getProviderLogo(model.provider_slug) ? 'block' : 'none'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <Badge 
              variant="outline" 
              className="text-xs gap-1"
              style={{ borderColor: getProviderColor(model.provider_slug) }}
            >
              {model.provider_slug && (
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: getProviderColor(model.provider_slug) }}
                />
              )}
              {model.provider_name}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userId && (
            <button
              onClick={() => {
                setSelectedModel(model);
                setIsAlertModalOpen(true);
              }}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label="Preis-Alert erstellen"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => onFavorite(model.model_id)}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label={favorites.includes(model.model_id) ? "Remove from favorites" : "Add to favorites"}
          >
            {favorites.includes(model.model_id) ? (
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
          <p className="font-medium">{formatPrice(model.input_price_per_million)}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Output</span>
          <p className="font-medium">{formatPrice(model.output_price_per_million)}</p>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">Kontext</span>
          <p className="font-medium">{formatContext(model.context_window)}</p>
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
        {selectedModel && userId && (
          <CreatePriceAlertModal
            isOpen={isAlertModalOpen}
            onClose={() => {
              setIsAlertModalOpen(false);
              setSelectedModel(null);
            }}
            model={selectedModel}
            userId={userId}
          />
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="md:hidden space-y-3">
        {sortedModels.slice(0, 20).map((model) => (
          <MobileCardView key={model.model_id} model={model} />
        ))}
      </div>

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
                    onClick={() => onFavorite(model.model_id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label={favorites.includes(model.model_id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {favorites.includes(model.model_id) ? (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <StarOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </td>
                <td className="p-3 font-medium">{model.model_name}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={getProviderLogo(model.provider_slug) || ''} 
                      alt={model.provider_name}
                      className="w-56 h-14 object-contain"
                      style={{ display: getProviderLogo(model.provider_slug) ? 'block' : 'none' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span 
                      className="text-sm"
                      style={{ display: getProviderLogo(model.provider_slug) ? 'none' : 'inline' }}
                    >
                      {model.provider_name}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right font-medium">
                  {formatPrice(model.input_price_per_million)}
                </td>
                <td className="p-3 text-right font-medium">
                  {formatPrice(model.output_price_per_million)}
                </td>
                <td className="p-3 text-right text-muted-foreground">
                  {formatContext(model.context_window)}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {model.capabilities?.slice(0, 3).map((cap) => (
                      <Badge key={cap} variant="secondary" className={`text-xs ${capabilityColors[cap] || ""}`}>
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right">
                  {userId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedModel(model);
                        setIsAlertModalOpen(true);
                      }}
                      title="Preis-Alert erstellen"
                    >
                      <Bell className="w-4 h-4" />
                    </Button>
                  )}
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

      {selectedModel && userId && (
        <CreatePriceAlertModal
          isOpen={isAlertModalOpen}
          onClose={() => {
            setIsAlertModalOpen(false);
            setSelectedModel(null);
          }}
          model={selectedModel}
          userId={userId}
        />
      )}
    </div>
  );
}
