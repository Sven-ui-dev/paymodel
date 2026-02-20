"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Navbar } from "@/components/ui-extended/Navbar";
import { PriceAlertsList } from "@/components/PriceAlertsList";
import { BenchmarkTool } from "@/components/BenchmarkTool";
import { ApiKeysManager } from "@/components/ApiKeysManager";
import { getModels, CurrentPrice } from "@/lib/supabase";
import { 
  Loader2,
  CreditCard,
  LogOut,
  Crown,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
  ChevronRight,
  Settings,
  Bell,
  User,
  Sparkles,
  Clock,
  RefreshCw,
  LucideProps,
  PieChart,
} from "lucide-react";
import Link from "next/link";

// Helper function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

interface Profile {
  id: string;
  email: string;
  subscription_plan: string;
  subscription_status: string;
  stripe_customer_id?: string;
  current_period_end?: string;
  created_at?: string;
}

// Feature list for each plan
type PlanType = 'free' | 'pro' | 'business';

interface PlanFeature {
  name: string;
  icon: React.ComponentType<Omit<LucideProps, "ref">>;
  included?: boolean;
}

const planFeatures: Record<PlanType, PlanFeature[]> = {
  free: [
    { name: "Preisvergleich", icon: BarChart3, included: true },
    { name: "Kostenrechner", icon: TrendingUp, included: true },
    { name: "5 Modell-Vergleiche/Tag", icon: Zap, included: false },
  ],
  pro: [
    { name: "Alles aus Free", icon: CheckCircle, included: true },
    { name: "Unbegrenzter Preisvergleich", icon: Zap, included: true },
    { name: "Echtzeit-Preise", icon: Clock, included: true },
    { name: "Preis-Benachrichtigungen", icon: Bell, included: true },
    { name: "Export-Funktionen", icon: Settings, included: true },
  ],
  business: [
    { name: "Alles aus Pro", icon: CheckCircle, included: true },
    { name: "API-Zugang", icon: Zap, included: true },
    { name: "Team-Funktionen", icon: User, included: true },
    { name: "Prioritäts-Support", icon: Shield, included: true },
    { name: "Custom Integrations", icon: Settings, included: true },
  ],
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [models, setModels] = useState<CurrentPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [manageLoading, setManageLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setProfile(profile);
    } else {
      // Create profile if not exists
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        subscription_plan: "free",
        subscription_status: "inactive",
      });
      setProfile({
        id: user.id,
        email: user.email!,
        subscription_plan: "free",
        subscription_status: "inactive",
      });
    }
    
    // Load models for benchmark
    const modelsData = await getModels();
    setModels(modelsData || []);
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleManageSubscription = async () => {
    if (!profile?.stripe_customer_id) {
      router.push("/pricing");
      return;
    }

    setManageLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: profile.stripe_customer_id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Fehler beim Öffnen des Stripe Portals");
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    } finally {
      setManageLoading(false);
    }
  };

  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!user?.email) {
      router.push("/login");
      return;
    }

    setManageLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          priceId,
          planName,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Fehler beim Erstellen des Checkouts");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    } finally {
      setManageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted animate-spin">
              <div className="w-full h-full rounded-full border-4 border-primary border-t-transparent" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  const planColors: Record<PlanType, { bg: string; text: string; border: string; gradient: string }> = {
    free: {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-muted-foreground/20",
      gradient: "from-gray-500 to-gray-600",
    },
    pro: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      border: "border-blue-500/20",
      gradient: "from-blue-500 to-blue-600",
    },
    business: {
      bg: "bg-purple-500/10",
      text: "text-purple-600",
      border: "border-purple-500/20",
      gradient: "from-purple-500 to-purple-600",
    },
  };

  const planPrices: Record<string, string> = {
    free: "0",
    pro: "19",
    business: "29",
  };

  const getInitials = (email: string) => {
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  const currentPlan: PlanType = (profile?.subscription_plan as PlanType) || "free";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                Willkommen zurück 👋
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Hier ist dein aktueller Abo-Status und deine Übersicht
              </p>
            </div>
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm sm:text-base">
                {profile?.email ? getInitials(profile.email) : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Subscription Overview Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Main Plan Card */}
          <Card className={`sm:col-span-2 border-2 ${planColors[currentPlan].border} overflow-hidden`}>
            <div className={`h-1 bg-gradient-to-r ${planColors[currentPlan].gradient}`} />
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${planColors[currentPlan].bg} flex items-center justify-center shrink-0`}>
                    <Crown className={`w-5 h-5 sm:w-6 sm:h-6 ${planColors[currentPlan].text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Aktueller Plan</p>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        className={`text-xs sm:text-sm ${
                          currentPlan === "free"
                            ? "bg-muted text-muted-foreground"
                            : currentPlan === "pro"
                            ? "bg-blue-500 text-white"
                            : "bg-purple-500 text-white"
                        }`}
                      >
                        {currentPlan === "pro" && <Crown className="w-3 h-3 mr-1" />}
                        {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                      </Badge>
                      {currentPlan !== "free" && (
                        <span className="text-sm sm:text-lg font-semibold">
                          €{planPrices[currentPlan]}/Monat
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {profile?.subscription_status === "active" ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Inaktiv
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4 sm:gap-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold">{modelsAfforded(currentPlan)}</p>
                    <p className="text-xs text-muted-foreground">Modelle</p>
                  </div>
                  <div className="w-px bg-border hidden sm:block" />
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {currentPlan === "free" ? "0%" : currentPlan === "pro" ? "40%" : "60%"}
                    </p>
                    <p className="text-xs text-muted-foreground">Einsparung</p>
                  </div>
                </div>
              </div>

              {/* Renewal Date */}
              {(currentPlan === "pro" || currentPlan === "business") && profile?.current_period_end && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-dashed">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Nächste Abrechnung</p>
                    <p className="font-medium text-sm">{formatDate(profile.current_period_end)}</p>
                  </div>
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-dashed">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Schnellaktionen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile?.subscription_status === "active" ? (
                <Button
                  variant="outline"
                  className="w-full justify-start text-xs sm:text-sm"
                  onClick={handleManageSubscription}
                  disabled={manageLoading}
                >
                  {manageLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  Subscription
                </Button>
              ) : (
                <Button className="w-full text-xs sm:text-sm" onClick={() => router.push("/pricing")}>
                  <Crown className="w-4 h-4 mr-2" />
                  Jetzt upgraden
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start text-xs sm:text-sm"
                onClick={() => router.push("/#kostenrechner")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Kostenrechner
              </Button>

              <Link href="/pricing" className="block">
                <Button variant="ghost" className="w-full justify-between text-xs sm:text-sm">
                  Alle Pläne
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full justify-start text-xs sm:text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="w-5 h-5 text-primary" />
              Deine Plan-Features
            </CardTitle>
            <CardDescription className="text-sm">
              Übersicht der in deinem Plan enthaltenen Funktionen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {planFeatures[currentPlan].map((feature, index) => (
                <div
                  key={feature.name}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    feature.included
                      ? "bg-primary/5"
                      : "bg-muted/50"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      feature.included
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {feature.included ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <feature.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-sm ${feature.included ? "font-medium" : "text-muted-foreground"}`}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade CTA for Free Users */}
        {currentPlan === "free" && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">Upgrade zu Pro</h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Erhalte erweiterte Features, Echtzeit-Preise und Premium-Support
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-background text-xs">
                        ✓ Echtzeit-Preise
                      </Badge>
                      <Badge variant="outline" className="bg-background text-xs">
                        ✓ Preis-Benachrichtigungen
                      </Badge>
                      <Badge variant="outline" className="bg-background text-xs">
                        ✓ Export-Funktionen
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                  <Button
                    className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-sm"
                    onClick={() => handleUpgrade("price_1T2UBVAwdEweUSNveqIRiSE2", "pro")}
                    disabled={manageLoading}
                  >
                    {manageLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Crown className="w-4 h-4 mr-2" />
                    )}
                    Pro €19/Monat
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none text-sm"
                    onClick={() => handleUpgrade("price_1T2UFEAwdEweUSNvkKOoPJSQ", "business")}
                    disabled={manageLoading}
                  >
                    Business €29/Monat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Price Alerts Section */}
        {user && <PriceAlertsList userId={user.id} />}

        {/* Benchmark Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Prompt-Benchmark</h2>
          <BenchmarkTool models={models} />
        </div>

        {/* API Keys Section - Business only */}
        {profile?.subscription_plan === "business" && user && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">API-Zugang</h2>
            <ApiKeysManager userId={user.id} />
          </div>
        )}

        {/* Info Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="group hover:border-primary/30 transition-colors cursor-pointer" onClick={() => router.push("/")}>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base mb-0.5">Preise vergleichen</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                    Alle AI-Modelle im direkten Vergleich
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/30 transition-colors cursor-pointer" onClick={() => router.push("/dashboard/stats")}>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors shrink-0">
                  <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base mb-0.5">Nutzungs-Statistiken</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                    Deine Aktivität und Einsparungen
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/30 transition-colors cursor-pointer" onClick={() => router.push("/#kostenrechner")}>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base mb-0.5">Kostenrechner</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                    Berechne deine monatlichen Kosten
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 sm:mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2026 paymodel.ai – Alle Rechte vorbehalten.</p>
          <div className="flex justify-center gap-3 sm:gap-4 mt-2">
            <Link href="/impressum" className="hover:text-foreground transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-foreground transition-colors">
              Datenschutz
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Kontakt
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function for demo purposes
function modelsAfforded(plan: string): string {
  switch (plan) {
    case "free":
      return "∞";
    case "pro":
      return "∞";
    case "business":
      return "∞";
    default:
      return "∞";
  }
}
