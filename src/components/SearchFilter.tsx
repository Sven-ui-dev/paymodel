"use client";

import { useState, useTransition } from "react";
import { Provider } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";

interface SearchFilterProps {
  providers: Provider[];
  selectedProvider?: string;
  onProviderChange?: (providerSlug: string | undefined) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
}

export function SearchFilter({
  providers,
  selectedProvider,
  onProviderChange,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Modelle suchen...",
}: SearchFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    startTransition(() => {
      onSearchChange?.(value);
    });
  };

  const clearFilters = () => {
    setLocalSearch("");
    onSearchChange?.("");
    onProviderChange?.(undefined);
  };

  const hasFilters = selectedProvider || localSearch;

  // Sort providers alphabetically
  const sortedProviders = [...providers].sort((a, b) => 
    a.name.localeCompare(b.name, 'de')
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-10 text-base w-full"
          />
        </div>

        {/* Provider Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedProvider === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => onProviderChange?.(undefined)}
          >
            Alle
          </Button>
          {sortedProviders.map((provider) => (
            <Button
              key={provider.id}
              variant={selectedProvider === provider.slug ? "default" : "outline"}
              size="sm"
              onClick={() => onProviderChange?.(provider.slug)}
            >
              {provider.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Aktive Filter:</span>
          {selectedProvider && (
            <Badge variant="secondary" className="gap-1">
              {providers.find((p) => p.slug === selectedProvider)?.name}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onProviderChange?.(undefined)}
              />
            </Badge>
          )}
          {localSearch && (
            <Badge variant="secondary" className="gap-1">
              Suche: "{localSearch}"
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  setLocalSearch("");
                  onSearchChange?.("");
                }}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
            Alle löschen
          </Button>
        </div>
      )}
    </div>
  );
}
