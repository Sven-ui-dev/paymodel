"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";

interface NavbarProps {
  user?: any;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">paymodel.ai</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/#preisvergleich" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Preisvergleich
            </Link>
            <Link 
              href="/#kostenrechner" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Kostenrechner
            </Link>
            <Link 
              href="/#features" 
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
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
            <Button variant="outline" size="sm" asChild>
              <Link href={user ? "/dashboard" : "/login"}>
                {user ? "Dashboard" : "Login"}
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/#waitlist">Early Access</Link>
            </Button>
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
                Preisvergleich
              </Link>
              <Link 
                href="/#kostenrechner" 
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kostenrechner
              </Link>
              <Link 
                href="/#features" 
                className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              {user ? (
                <Link 
                  href="/dashboard" 
                  className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Button asChild className="mt-2">
                    <Link href="/#waitlist" onClick={() => setMobileMenuOpen(false)}>
                      Early Access
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
