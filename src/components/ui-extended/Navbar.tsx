"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, LogOut } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  user?: any;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const nav = locale === "de" ? {
    priceComparison: "Preisvergleich",
    costCalculator: "Kostenrechner",
    features: "Features",
    apiDocs: "API Doku",
    dashboard: "Dashboard",
    login: "Login",
    logout: "Abmelden",
    earlyAccess: "Early Access",
  } : {
    priceComparison: "Price Comparison",
    costCalculator: "Cost Calculator",
    features: "Features",
    apiDocs: "API Docs",
    dashboard: "Dashboard",
    login: "Login",
    logout: "Logout",
    earlyAccess: "Early Access",
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="paymodel.ai" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/#preisvergleich" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {nav.priceComparison}
            </Link>
            <Link 
              href="/#kostenrechner" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {nav.costCalculator}
            </Link>
            <Link 
              href="/#features" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {nav.features}
            </Link>
            <Link 
              href="/api-docs" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {nav.apiDocs}
            </Link>
            {user && (
              <Link 
                href="/dashboard" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">{nav.dashboard}</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  {nav.logout}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">{nav.login}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/#waitlist">{nav.earlyAccess}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-4 border-t">
            <nav className="flex flex-col gap-3">
              <Link 
                href="/#preisvergleich" 
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {nav.priceComparison}
              </Link>
              <Link 
                href="/#kostenrechner" 
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {nav.costCalculator}
              </Link>
              <Link 
                href="/#features" 
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {nav.features}
              </Link>
              <Link 
                href="/api-docs" 
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {nav.apiDocs}
              </Link>
              <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocale(locale === "de" ? "en" : "de")}
            className="text-xs font-medium"
          >
            {locale === "de" ? "EN" : "DE"}
          </Button>
          
          {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {nav.dashboard}
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="justify-start px-3 py-2 text-sm font-medium"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    {nav.logout}
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {nav.login}
                  </Link>
                  <Button asChild className="mt-2">
                    <Link href="/#waitlist" onClick={() => setMobileMenuOpen(false)}>
                      {nav.earlyAccess}
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
