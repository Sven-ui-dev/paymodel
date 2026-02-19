"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  BarChart3,
  TrendingUp,
  Bookmark,
  Search,
  DollarSign,
  Star,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

type TimeRange = "7d" | "30d" | "all";

interface UsageStats {
  savedModels: number;
  totalQueries: number;
  mostUsedModels: { name: string; count: number; provider: string }[];
  savingsData: { date: string; amount: number }[];
  dailyQueries: { date: string; count: number }[];
  totalSavings: number;
}

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [stats, setStats] = useState<UsageStats>({
    savedModels: 0,
    totalQueries: 0,
    mostUsedModels: [],
    savingsData: [],
    dailyQueries: [],
    totalSavings: 0,
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchStats();
    }
  }, [timeRange, loading]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    // Simulated data for demo - in production, fetch from Supabase
    // Based on time range, adjust the data
    
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    
    // Generate daily query data
    const dailyQueries = [];
    const savingsData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      dailyQueries.push({
        date: dateStr,
        count: Math.floor(Math.random() * 20) + 1,
      });
      
      savingsData.push({
        date: dateStr,
        amount: Math.floor(Math.random() * 50) + 5,
      });
    }

    // Mock data based on time range
    const multiplier = timeRange === "7d" ? 1 : timeRange === "30d" ? 4 : 12;
    
    setStats({
      savedModels: 12 * multiplier,
      totalQueries: Math.floor(Math.random() * 200) * multiplier,
      mostUsedModels: [
        { name: "GPT-4o", count: Math.floor(Math.random() * 50) * multiplier, provider: "OpenAI" },
        { name: "Claude 3.5 Sonnet", count: Math.floor(Math.random() * 40) * multiplier, provider: "Anthropic" },
        { name: "Gemini 1.5 Pro", count: Math.floor(Math.random() * 30) * multiplier, provider: "Google" },
        { name: "GPT-4o-mini", count: Math.floor(Math.random() * 25) * multiplier, provider: "OpenAI" },
        { name: "Llama 3.1 405B", count: Math.floor(Math.random() * 15) * multiplier, provider: "Meta" },
      ],
      dailyQueries,
      savingsData,
      totalSavings: Math.floor(Math.random() * 500) * multiplier + 150,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Statistiken werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg tracking-tight">paymodel.ai</span>
              </div>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              {(["7d", "30d", "all"] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className="min-w-[60px]"
                >
                  {range === "7d" ? "7 Tage" : range === "30d" ? "30 Tage" : "Allzeit"}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Nutzungs-Statistiken
          </h1>
          <p className="text-muted-foreground">
            Übersicht deiner Aktivität und Einsparungen
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Saved Models */}
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-blue-600" />
                </div>
                <Badge variant="secondary">Favoriten</Badge>
              </div>
              <p className="text-3xl font-bold">{stats.savedModels}</p>
              <p className="text-sm text-muted-foreground">Gespeicherte Modelle</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
          </Card>

          {/* Total Queries */}
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-green-600" />
                </div>
                <Badge variant="secondary">Suchen</Badge>
              </div>
              <p className="text-3xl font-bold">{stats.totalQueries}</p>
              <p className="text-sm text-muted-foreground">Suchanfragen gesamt</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-400" />
          </Card>

          {/* Total Savings */}
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <Badge variant="secondary">Einsparungen</Badge>
              </div>
              <p className="text-3xl font-bold">€{stats.totalSavings}</p>
              <p className="text-sm text-muted-foreground">Kosten gespart</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
          </Card>

          {/* Average Savings per Query */}
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <Badge variant="secondary">Pro Such</Badge>
              </div>
              <p className="text-3xl font-bold">
                €{stats.totalQueries > 0 ? (stats.totalSavings / stats.totalQueries).toFixed(2) : "0.00"}
              </p>
              <p className="text-sm text-muted-foreground">Ø Einsparung pro Query</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-400" />
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily Queries Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Suchanfragen pro Tag
              </CardTitle>
              <CardDescription>
                Anzahl der Preisvergleiche im gewählten Zeitraum
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* CSS Bar Chart */}
              <div className="space-y-4">
                <div className="h-48 flex items-end justify-between gap-1">
                  {stats.dailyQueries.slice(-14).map((item, index) => {
                    const maxCount = Math.max(...stats.dailyQueries.map(d => d.count));
                    const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    const date = new Date(item.date);
                    const dayLabel = date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric" });
                    
                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all duration-300 hover:from-primary/80 hover:to-primary/40"
                          style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                          title={`${item.count} Suchanfragen`}
                        />
                        <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                          {dayLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{stats.dailyQueries[0]?.date || "-"}</span>
                  <span>{stats.dailyQueries[stats.dailyQueries.length - 1]?.date || "-"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Most Used Models */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Meistgenutzte Modelle
              </CardTitle>
              <CardDescription>
                Deine Top 5 Modelle nach Nutzung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.mostUsedModels.map((model, index) => {
                  const maxCount = Math.max(...stats.mostUsedModels.map(m => m.count));
                  const percentage = maxCount > 0 ? (model.count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={model.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{model.name}</p>
                            <p className="text-xs text-muted-foreground">{model.provider}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{model.count}x</Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Savings Chart */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Kosten-Einsparungen
            </CardTitle>
            <CardDescription>
              Deine Ersparnisse durch den Preisvergleich im Zeitraum
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* CSS Line Chart for Savings */}
            <div className="space-y-4">
              <div className="h-48 relative flex items-end justify-between gap-1">
                {stats.savingsData.slice(-14).map((item, index) => {
                  const maxAmount = Math.max(...stats.savingsData.map(d => d.amount));
                  const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                  const date = new Date(item.date);
                  const dayLabel = date.toLocaleDateString("de-DE", { weekday: "short", day: "numeric" });
                  
                  return (
                    <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="relative group w-full flex justify-center">
                        <div
                          className="w-full max-w-[30px] bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-300 hover:from-green-600 hover:to-green-500"
                          style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0' }}
                        />
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover border rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap z-10">
                          €{item.amount}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stats.savingsData[0]?.date || "-"}</span>
                <span>Gesamt: <strong>€{stats.totalSavings}</strong></span>
                <span>{stats.savingsData[stats.savingsData.length - 1]?.date || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="mt-6 bg-gradient-to-r from-primary/5 via-primary/10 to-background border-primary/20">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold">
                  {timeRange === "7d" ? "7" : timeRange === "30d" ? "30" : "90"}
                </p>
                <p className="text-sm text-muted-foreground">Tage aktiv</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold">
                  {timeRange === "7d" ? "1.4" : timeRange === "30d" ? "6.7" : "20.2"}
                </p>
                <p className="text-sm text-muted-foreground">Ø Vergleiche pro Tag</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-2xl font-bold">
                  €{timeRange === "7d" ? "150" : timeRange === "30d" ? "420" : "980"}
                </p>
                <p className="text-sm text-muted-foreground">Ø Monatliche Ersparnis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 paymodel.ai – Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}
