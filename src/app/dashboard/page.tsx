"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Settings, LogOut, Crown } from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  email: string;
  subscription_plan: string;
  subscription_status: string;
  stripe_customer_id?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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
      }
    } catch (error) {
      console.error("Portal error:", error);
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
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setManageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const planColors: Record<string, string> = {
    free: "bg-gray-500",
    pro: "bg-blue-500",
    business: "bg-purple-500",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">
              paymodel.ai
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-sm font-medium">
                Preise
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Konto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">E-Mail</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Plan</p>
                <Badge className={planColors[profile?.subscription_plan || "free"]}>
                  {profile?.subscription_plan === "pro" && <Crown className="w-3 h-3 mr-1" />}
                  {(profile?.subscription_plan || "free").toUpperCase()}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={profile?.subscription_status === "active" ? "default" : "secondary"}>
                  {profile?.subscription_status === "active" ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
              
              {profile?.subscription_status === "active" ? (
                <Button onClick={handleManageSubscription} disabled={manageLoading}>
                  {manageLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                  Subscription verwalten
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button>Upgrade</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Preise vergleichen</CardTitle>
              <CardDescription>
                Alle AI-Modelle im Überblick
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Preisvergleich öffnen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kostenrechner</CardTitle>
              <CardDescription>
                Berechne deine monatlichen Kosten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/#kostenrechner">
                <Button variant="outline" className="w-full">
                  Rechner öffnen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade CTA for Free Users */}
        {profile?.subscription_plan === "free" && (
          <Card className="mt-8 bg-primary/5">
            <CardHeader>
              <CardTitle>Upgrade zu Pro</CardTitle>
              <CardDescription>
                Erhalte erweiterte Features und Support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleUpgrade("price_1T2UBVAwdEweUSNveqIRiSE2", "pro")}
                  disabled={manageLoading}
                >
                  Pro für €19/Monat
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleUpgrade("price_1T2UFEAwdEweUSNvkKOoPJSQ", "business")}
                  disabled={manageLoading}
                >
                  Business für €29/Monat
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
