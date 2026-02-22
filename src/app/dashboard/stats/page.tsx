"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, DollarSign, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

type TimeRange = "7d" | "30d" | "90d";

interface ProviderCost {
  provider: string;
  totalCost: number;
  modelCount: number;
  inputTokens: number;
  outputTokens: number;
}

interface UsageStats {
  totalCost: number;
  providerCosts: ProviderCost[];
  recentUsage: any[];
  monthlyTrend: { month: string; cost: number }[];
}

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [stats, setStats] = useState<UsageStats>({
    totalCost: 0,
    providerCosts: [],
    recentUsage: [],
    monthlyTrend: [],
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (supabase) {
      loadStats();
    }
  }, [timeRange]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    loadStats();
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate date range
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get benchmark results for the user
      const { data: results, error } = await supabase
        .from("benchmark_results")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading stats:", error);
      }

      // Calculate totals by provider
      const providerMap = new Map<string, ProviderCost>();
      let totalCost = 0;

      results?.forEach((result: any) => {
        const provider = result.provider_slug || "unknown";
        const cost = parseFloat(result.total_cost) || 0;
        
        totalCost += cost;
        
        if (providerMap.has(provider)) {
          const existing = providerMap.get(provider)!;
          existing.totalCost += cost;
          existing.modelCount += 1;
          existing.inputTokens += result.input_tokens || 0;
          existing.outputTokens += result.output_tokens || 0;
        } else {
          providerMap.set(provider, {
            provider,
            totalCost: cost,
            modelCount: 1,
            inputTokens: result.input_tokens || 0,
            outputTokens: result.output_tokens || 0,
          });
        }
      });

      const providerCosts = Array.from(providerMap.values()).sort((a, b) => b.totalCost - a.totalCost);

      setStats({
        totalCost,
        providerCosts,
        recentUsage: results?.slice(0, 10) || [],
        monthlyTrend: [],
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold text-lg">Kosten-Übersicht</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Time Range Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {(["7d", "30d", "90d"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {range === "7d" ? "7 Tage" : range === "30d" ? "30 Tage" : "90 Tage"}
            </button>
          ))}
        </div>

        {/* Total Cost */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Gesamtkosten
            </CardTitle>
            <CardDescription>
              Deine API-Kosten im gewählten Zeitraum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-500">
              €{stats.totalCost.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        {/* Provider Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Kosten nach Anbieter
            </CardTitle>
            <CardDescription>
              Aufschlüsselung deiner Ausgaben pro Provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.providerCosts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Noch keine Benchmark-Ergebnisse. Starte einen Benchmark um Kosten zu tracken.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.providerCosts.map((provider) => (
                  <div key={provider.provider} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{provider.provider}</p>
                      <p className="text-sm text-muted-foreground">
                        {provider.modelCount} Anfragen • {(provider.inputTokens + provider.outputTokens).toLocaleString()} Tokens
                      </p>
                    </div>
                    <p className="font-bold text-green-500">€{provider.totalCost.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Letzte Nutzung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentUsage.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Keine Nutzung in diesem Zeitraum
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentUsage.map((usage: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{usage.model_slug}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(usage.created_at).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">€{parseFloat(usage.total_cost || 0).toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">
                        {(usage.input_tokens + usage.output_tokens).toLocaleString()} Tokens
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
