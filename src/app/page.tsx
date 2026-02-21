"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { ModelList } from "@/components/ModelList";
import { PriceCalculator } from "@/components/PriceCalculator";
import { BenchmarkTool } from "@/components/BenchmarkTool";
import { SearchFilter } from "@/components/SearchFilter";
import { getModels, getProviders, CurrentPrice, Provider } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui-extended/Navbar";
import { StatsBar } from "@/components/ui-extended/StatsBar";
import { ModelTable } from "@/components/ui-extended/ModelTable";
import { Bell, BarChart3, Github, Menu, ExternalLink, Zap, Target, DollarSign, Shield, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";
import { getProviderLogo, getProviderColor } from "@/lib/providerLogos";
import { useLocale } from "@/components/LocaleProvider";

export default function Home() {
  const [models, setModels] = useState<CurrentPrice[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredModels, setFilteredModels] = useState<CurrentPrice[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const { locale } = useLocale();
  
  const t = locale === "de" ? {
    heroTitle: "AI-Modelle vergleichen & sparen",
    heroSubtitle: "Finde die günstigsten AI-Modelle für deine Use Cases",
    features: "Funktionen",
    pricing: "Preise",
    dashboard: "Dashboard",
    featuresTitle: "Alle Modelle. Alle Preise. Ein Blick.",
    priceComparison: "Preisvergleich",
    priceComparisonDesc: "Vergleiche Preise von über 300 AI-Modellen",
    costCalculator: "Kostenrechner",
    costCalculatorDesc: "Berechne die Kosten für deinen Use-Case",
    benchmark: "Benchmark",
    benchmarkDesc: "Teste deine Prompts gegen alle Modelle",
    inputPlaceholder: "Input Tokens",
    outputPlaceholder: "Output Tokens",
    inputLabel: "Input-Tokens / Monat",
    outputLabel: "Output-Tokens / Monat",
    calculate: "Berechnen",
    totalCost: "Gesamtkosten/Monat",
    cheapest: "Günstigstes",
    realTimePrices: "Echtzeit-Preise",
    realTimePricesDesc: "Aktuelle Token-Preise aller großen Anbieter. Automatisch aktualisiert.",
    trackSpending: "Ausgaben verfolgen",
    trackSpendingDesc: "Verbinde deine API-Keys und sieh in Echtzeit, wo dein Geld hinfließt.",
    teamSavings: "Team-Updates",
    teamSavingsDesc: "Zeige deinem Team, wie viel ihr durch den Modellwechsel spart.",
    waitlistTitle: "Early Access",
    waitlistDesc: "Sichere dir kostenlosen Zugang zum Preisvergleich.",
    waitlistSuccess: "Vielen Dank! Du bist auf der Warteliste.",
    noSpam: "Kein Spam. Abmeldung jederzeit.",
    joinWaitlist: "Auf die Warteliste",
    moreThanPriceComparison: "Mehr als ein Preisvergleich.",
    livePriceComparison: "Live-Preisvergleich",
    personalizedBenchmarks: "Personalisierte Benchmarks",
  } : {
    heroTitle: "Compare AI Models & Save",
    heroSubtitle: "Find the cheapest AI models for your use cases",
    features: "Features",
    pricing: "Pricing",
    dashboard: "Dashboard",
    featuresTitle: "All Models. All Prices. One Look.",
    priceComparison: "Price Comparison",
    priceComparisonDesc: "Compare prices of 300+ AI models",
    costCalculator: "Cost Calculator",
    costCalculatorDesc: "Calculate costs for your use case",
    benchmark: "Benchmark",
    benchmarkDesc: "Test your prompts against all models",
    inputPlaceholder: "Input Tokens",
    outputPlaceholder: "Output Tokens",
    inputLabel: "Input tokens / month",
    outputLabel: "Output tokens / month",
    calculate: "Calculate",
    totalCost: "Total Cost/Month",
    cheapest: "Cheapest",
    realTimePrices: "Real-time Prices",
    realTimePricesDesc: "Current token prices from all major providers. Automatically updated.",
    trackSpending: "Track Spending",
    trackSpendingDesc: "Connect your API keys and see where your money goes in real-time.",
    teamSavings: "Team Updates",
    teamSavingsDesc: "Show your team how much you save by switching models.",
    waitlistTitle: "Early Access",
    waitlistDesc: "Get free access to the price comparison and be the first to know.",
    waitlistSuccess: "Thank you! You're on the waitlist.",
    noSpam: "No spam. Unsubscribe anytime.",
    joinWaitlist: "Join Waitlist",
    moreThanPriceComparison: "More than a price comparison.",
    livePriceComparison: "Live Price Comparison",
    personalizedBenchmarks: "Personalized Benchmarks",
  };

  useEffect(() => {
    // Check if user is logged in
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
      });
    });
  }, []);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculatorInput, setCalculatorInput] = useState(2500000);
  const [calculatorOutput, setCalculatorOutput] = useState(1000000);
  
  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [modelsData, providersData] = await Promise.all([
          getModels(),
          getProviders(),
        ]);
        // Sort by sort_order client-side (Supabase order not always reliable)
        const sortedModels = (modelsData || []).sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
        setModels(sortedModels);
        setFilteredModels(sortedModels);
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
    // Filter out free models
    filtered = filtered.filter((m) => m.input_price_per_million > 0 || m.output_price_per_million > 0);
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

  // Handle waitlist submission
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) return;
    
    setWaitlistLoading(true);
    setWaitlistMessage(null);
    
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setWaitlistMessage({ type: 'success', text: t.waitlistSuccess });
        toast.success('Angemeldet!', { description: 'Du bist auf der Early Access Warteliste.' });
        setWaitlistEmail('');
      } else {
        setWaitlistMessage({ type: 'error', text: data.error || 'Ein Fehler ist aufgetreten.' });
        toast.error('Fehler', { description: data.error || 'Etwas ist schiefgelaufen.' });
      }
    } catch (error) {
      setWaitlistMessage({ type: 'error', text: 'Ein Fehler ist aufgetreten. Bitte später erneut versuchen.' });
    } finally {
      setWaitlistLoading(false);
    }
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

  // Stats
  const modelCount = models.length;
  const providerCount = providers.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar user={user} />

      {/* Stats Bar */}
      <StatsBar modelCount={modelCount} providerCount={providerCount} />

      <main>
        {/* Features Section */}
        <section id="features" className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">{t.heroTitle}</h2>
            <p className="text-lg text-muted-foreground text-center mb-8">
              {t.heroSubtitle}
            </p>
            
            {/* Feature Cards - Bento Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Preisvergleich */}
              <a href="#preisvergleich" className="group p-6 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}
                >
                  <BarChart3 className="w-6 h-6" style={{ color: '#2ECC71' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.priceComparison}</h3>
                <p className="text-sm text-muted-foreground">{t.priceComparisonDesc}</p>
              </a>

              {/* Kostenrechner */}
              <a href="#kostenrechner" className="group p-6 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}
                >
                  <DollarSign className="w-6 h-6" style={{ color: '#2ECC71' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.costCalculator}</h3>
                <p className="text-sm text-muted-foreground">{t.costCalculatorDesc}</p>
              </a>

              {/* Benchmark */}
              <a href="#benchmark" className="group p-6 rounded-xl border bg-card hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}
                >
                  <Zap className="w-6 h-6" style={{ color: '#2ECC71' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t.benchmark}</h3>
                <p className="text-sm text-muted-foreground">{t.benchmarkDesc}</p>
              </a>
            </div>
          </div>
        </section>

        {/* Search / Filter */}
        <section id="preisvergleich" className="py-12 px-4">
          <div className="container mx-auto">
            <h3 className="text-2xl font-bold mb-6">{t.priceComparison}</h3>
            
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
                  <div key={i} className="h-24 bg-muted rounded-lg" />
                ))}
              </div>
            ) : (
              <ModelTable
                models={filteredModels}
                favorites={favorites}
                onFavorite={handleFavorite}
                userId={user?.id}
              />
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

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setCalculatorInput(100000); setCalculatorOutput(50000); }}
              >
                💬 Chatbot (150K)
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setCalculatorInput(500000); setCalculatorOutput(2000000); }}
              >
                ✍️ Content (2.5M)
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setCalculatorInput(2000000); setCalculatorOutput(1000000); }}
              >
                💻 Coding (3M)
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setCalculatorInput(5000000); setCalculatorOutput(3000000); }}
                >
                📊 Analytics (8M)
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { setCalculatorInput(10000000); setCalculatorOutput(5000000); }}
              >
                🏢 Enterprise (15M)
              </Button>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.inputLabel}</label>
                  <input
                    type="number"
                    value={calculatorInput}
                    onChange={(e) => setCalculatorInput(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.outputLabel}</label>
                  <input
                    type="number"
                    value={calculatorOutput}
                    onChange={(e) => setCalculatorOutput(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {sortedModels.slice(0, 10).map((model, index) => {
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
                          <Badge className="text-xs">{t.cheapest}</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Benchmark Section */}
        <section id="benchmark" className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center">Teste deine Prompts</h3>
            <BenchmarkTool models={models} />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h3 id="features" className="text-2xl font-bold mb-8 text-center">{t.moreThanPriceComparison}</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4 p-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}
                >
                  <BarChart3 className="w-5 h-5" style={{ color: '#2ECC71' }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t.livePriceComparison}</h4>
                  <p className="text-sm text-muted-foreground">
                    Aktuelle Token-Preise aller großen Anbieter. Automatisch aktualisiert, transparent aufbereitet.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}
                >
                  <Zap className="w-5 h-5" style={{ color: '#2ECC71' }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t.personalizedBenchmarks}</h4>
                  <p className="text-sm text-muted-foreground">
                    Lade deine eigenen Prompts hoch und teste sie gegen alle Modelle.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}
                >
                  <TrendingUp className="w-5 h-5" style={{ color: '#2ECC71' }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Kosten-Dashboard</h4>
                  <p className="text-sm text-muted-foreground">
                    Verbinde deine API-Keys und sieh in Echtzeit, wo dein Geld hinfließt.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}
                >
                  <Bell className="w-5 h-5" style={{ color: '#2ECC71' }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Preis-Alerts</h4>
                  <p className="text-sm text-muted-foreground">
                    Werde sofort benachrichtigt, wenn sich Preise ändern.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}
                >
                  <Shield className="w-5 h-5" style={{ color: '#2ECC71' }} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">ROI-Reports</h4>
                  <p className="text-sm text-muted-foreground">
                    Zeige deinem Team, wie viel ihr durch den Modellwechsel spart.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)' }}
                >
                  <Shield className="w-5 h-5" style={{ color: '#2ECC71' }} />
                </div>
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
            <h3 className="text-2xl font-bold mb-4">{t.waitlistTitle}</h3>
            <p className="text-muted-foreground mb-6">
              Sichere dir kostenlosen Zugang zum Preisvergleich und werde als Erster benachrichtigt, wenn der personalisierte Benchmark-Service startet.
            </p>
            <form onSubmit={handleWaitlistSubmit} className="flex gap-2 justify-center">
              <Input 
                type="email" 
                placeholder={locale === "de" ? "Deine E-Mail-Adresse" : "Your email address"} 
                className="max-w-xs"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                disabled={waitlistLoading}
                required
              />
              <Button type="submit" disabled={waitlistLoading}>
                {waitlistLoading ? '...' : 'Anmelden'}
              </Button>
            </form>
            {waitlistMessage && (
              <p className={`text-sm mt-3 ${waitlistMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {waitlistMessage.text}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              {t.noSpam}
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8 px-4">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
            <p>© 2026 paymodel.ai – Alle Rechte vorbehalten.</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link href="/impressum" className="hover:underline">Impressum</Link>
              <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
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
