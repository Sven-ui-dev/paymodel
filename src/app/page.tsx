"use client";

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ModelList } from "@/components/ModelList";
import { PriceCalculator } from "@/components/PriceCalculator";
import { SearchFilter } from "@/components/SearchFilter";
import { getModels, getProviders, CurrentPrice, Provider } from "@/lib/supabase";
import { Toaster as Sonner } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BarChart3, Github, Menu } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [models, setModels] = useState<CurrentPrice[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredModels, setFilteredModels] = useState<CurrentPrice[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [modelsData, providersData] = await Promise.all([
          getModels(),
          getProviders(),
        ]);
        setModels(modelsData);
        setFilteredModels(modelsData);
        setProviders(providersData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("paymodel-favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    let filtered = models;

    if (selectedProvider) {
      filtered = filtered.filter((m) => m.provider_slug === selectedProvider);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.model_name.toLowerCase().includes(query) ||
          m.provider_name.toLowerCase().includes(query)
      );
    }

    setFilteredModels(filtered);
  }, [models, selectedProvider, searchQuery]);

  const handleFavorite = (modelId: string) => {
    const newFavorites = favorites.includes(modelId)
      ? favorites.filter((id) => id !== modelId)
      : [...favorites, modelId];

    setFavorites(newFavorites);
    localStorage.setItem("paymodel-favorites", JSON.stringify(newFavorites));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">🤖 paymodel.ai</h1>
              <Badge variant="outline">AI Model Preisvergleich</Badge>
            </div>

            <nav className="hidden md:flex items-center gap-4">
              <Link href="/compare" className="text-sm font-medium hover:underline">
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Vergleichen
              </Link>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://payalert.ai" target="_blank">
                  <Bell className="w-4 h-4 inline mr-1" />
                  Preis-Alerts
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://github.com/payclear/paymodel-ai" target="_blank">
                  <Github className="w-4 h-4 inline mr-1" />
                  GitHub
                </a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Finde das richtige AI-Modell zum besten Preis
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Vergleiche Token-Preise, Context-Windows und Capabilities von allen
            großen AI-Providen. Mit interaktivem Rechner für deinen Use-Case.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <SearchFilter
            providers={providers}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Model List - 2/3 width */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg" />
                ))}
              </div>
            ) : (
              <ModelList
                models={filteredModels}
                onFavorite={handleFavorite}
                favorites={favorites}
              />
            )}
          </div>

          {/* Price Calculator - 1/3 width */}
          <div className="lg:col-span-1">
            <PriceCalculator models={filteredModels} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tipp:</strong> Nutze den Preis-Rechner, um die Kosten für
            deinen spezifischen Use-Case zu berechnen. Preise werden täglich
            aktualisiert.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ Affiliate-Links unterstützen uns. Preise können abweichen.
          </p>
        </div>
      </main>

      <Toaster />
    </div>
  );
}
