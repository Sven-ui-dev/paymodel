"use client";

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ModelList } from "@/components/ModelList";
import { PriceCalculator } from "@/components/PriceCalculator";
import { SearchFilter } from "@/components/SearchFilter";
import { getModels, getProviders, CurrentPrice, Provider } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, BarChart3, Github, Menu, ExternalLink, Zap, Target, DollarSign, Shield, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [models, setModels] = useState<CurrentPrice[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredModels, setFilteredModels] = useState<CurrentPrice[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculatorInput, setCalculatorInput] = useState(2500000);
  const [calculatorOutput, setCalculatorOutput] = useState(1000000);

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
      } catch (error: any) {
        console.error("Error loading data:", error?.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();

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

  // Calc costs for calculator
  const calculateCost = (pricePerMillion: number) => {
    return ((calculatorInput + calculatorOutput) / 1000000) * pricePerMillion;
  };

  const sortedModels = [...filteredModels].sort((a, b) => {
    const costA = calculateCost(a.input_price_per_million) + calculateCost(a.output_price_per_million);
    const costB = calculateCost(b.input_price_per_million) + calculateCost(b.output_price_per_million);
    return costA - costB;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">
                <img src="/logo.svg" alt="paymodel.ai" className="h-7" />
              </h1>
              
              <nav className="hidden md:flex items-center gap-6">
                <a href="#preisvergleich" className="text-sm font-medium hover:text-primary transition">
                  Preisvergleich
                </a>
                <a href="#kostenrechner" className="text-sm font-medium hover:text-primary transition">
                  Kostenrechner
                </a>
                <a href="#features" className="text-sm font-medium hover:text-primary transition">
                  Features
                </a>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" asChild>
                <a href="#waitlist">Early Access</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 px-4 text-center bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Alle Modelle. Alle Preise. Ein Blick.
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Aktuelle Token-Preise, Geschwindigkeit und Qualität der wichtigsten AI-Modelle im direkten Vergleich.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg">
                <a href="#preisvergleich">Preisvergleich</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#kostenrechner">Kostenrechner</a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a href="#waitlist">Benchmark-Zugang sichern</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Preisvergleich Section */}
        <section id="preisvergleich" className="py-12 px-4">
          <div className="container mx-auto">
            <h3 className="text-2xl font-bold mb-6">Preisvergleich</h3>
            
            {/* Search */}
            <div className="mb-6">
              <SearchFilter
                providers={providers}
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Model Table */}
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Modell</th>
                      <th className="text-left p-3 font-medium">Provider</th>
                      <th className="text-right p-3 font-medium">Input / 1M</th>
                      <th className="text-right p-3 font-medium">Output / 1M</th>
                      <th className="text-right p-3 font-medium">Kontext</th>
                      <th className="text-left p-3 font-medium">Capabilities</th>
                      <th className="text-right p-3 font-medium">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModels.slice(0, 15).map((model) => (
                      <tr key={model.model_id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">{model.model_name}</td>
                        <td className="p-3">
                          <Badge variant="outline">{model.provider_name}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          €{model.input_price_per_million.toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          €{model.output_price_per_million.toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          {model.context_window >= 1000000 
                            ? `${(model.context_window / 1000000).toFixed(0)}M`
                            : `${(model.context_window / 1000).toFixed(0)}K`}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            {model.capabilities?.slice(0, 3).map((cap: string) => (
                              <Badge key={cap} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
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
            )}
          </div>
        </section>

        {/* Kostenrechner Section */}
        <section id="kostenrechner" className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center">Was kostet dein AI-Setup wirklich?</h3>
            <p className="text-muted-foreground text-center mb-8">
              Gib dein monatliches Volumen ein und sieh sofort, welches Modell für dich am günstigsten ist.
            </p>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Input-Tokens / Monat</label>
                  <input
                    type="number"
                    value={calculatorInput}
                    onChange={(e) => setCalculatorInput(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Output-Tokens / Monat</label>
                  <input
                    type="number"
                    value={calculatorOutput}
                    onChange={(e) => setCalculatorOutput(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {sortedModels.slice(0, 6).map((model, index) => {
                  const totalCost = calculateCost(model.input_price_per_million) + calculateCost(model.output_price_per_million);
                  return (
                    <div
                      key={model.model_id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{model.model_name}</p>
                        <p className="text-sm text-muted-foreground">{model.provider_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">€{totalCost.toFixed(2)}/Mo</p>
                        {index === 0 && (
                          <Badge className="text-xs">Günstigstes</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h3 id="features" className="text-2xl font-bold mb-8 text-center">Mehr als ein Preisvergleich.</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4 p-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h4 className="font-semibold mb-1">Live-Preisvergleich</h4>
                  <p className="text-sm text-muted-foreground">
                    Aktuelle Token-Preise aller großen Anbieter. Automatisch aktualisiert, transparent aufbereitet.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div className="text-3xl">🎯</div>
                <div>
                  <h4 className="font-semibold mb-1">Personalisierte Benchmarks</h4>
                  <p className="text-sm text-muted-foreground">
                    Lade deine eigenen Prompts hoch und teste sie gegen alle Modelle.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div className="text-3xl">💰</div>
                <div>
                  <h4 className="font-semibold mb-1">Kosten-Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    Verbinde deine API-Keys und sieh in Echtzeit, wo dein Geld hinfließt.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div className="text-3xl">🔔</div>
                <div>
                  <h4 className="font-semibold mb-1">Preis-Alerts</h4>
                  <p className="text-sm text-muted-foreground">
                    Werde sofort benachrichtigt, wenn sich Preise ändern.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div className="text-3xl">📈</div>
                <div>
                  <h4 className="font-semibold mb-1">ROI-Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Zeige deinem Team, wie viel ihr durch den Modellwechsel spart.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div className="text-3xl">🔒</div>
                <div>
                  <h4 className="font-semibold mb-1">DSGVO-konform</h4>
                  <p className="text-sm text-muted-foreground">
                    Hosting in der EU, keine Weitergabe deiner Prompts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Early Access Section */}
        <section id="waitlist" className="py-16 px-4 bg-primary/5">
          <div className="container mx-auto max-w-xl text-center">
            <h3 className="text-2xl font-bold mb-4">Early Access</h3>
            <p className="text-muted-foreground mb-6">
              Sichere dir kostenlosen Zugang zum Preisvergleich und werde als Erster benachrichtigt, wenn der personalisierte Benchmark-Service startet.
            </p>
            <div className="flex gap-2 justify-center">
              <Input 
                type="email" 
                placeholder="Deine E-Mail-Adresse" 
                className="max-w-xs"
              />
              <Button>Anmelden</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Kein Spam. Abmeldung jederzeit.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 px-4">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© 2026 paymodel.ai – Alle Rechte vorbehalten.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/impressum" className="hover:underline">Impressum</Link>
              <Link href="/contact" className="hover:underline">Kontakt</Link>
              <a href="mailto:info@paymodel.ai" className="hover:underline">info@paymodel.ai</a>
            </div>
          </div>
        </footer>
      </main>

      <Toaster />
    </div>
  );
}
