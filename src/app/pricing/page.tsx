"use client";

import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/ui-extended/Navbar';

const PLANS = [
  {
    name: 'Free',
    price: '0',
    period: '/Monat',
    description: 'Für Einsteiger',
    features: [
      'Preisvergleich aller Modelle',
      'Kostenrechner',
      '10 Modelle speichern',
    ],
    priceId: null,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '19',
    period: '/Monat',
    description: 'Für Power-User',
    features: [
      'Alles aus Free',
      'Unbegrenzte Modelle speichern',
      'Preis-Alerts',
      'Export-Funktionen',
      'Priority Support',
    ],
    priceId: 'price_1T2X6dAwdEweUSNvrHZoUFCd',
    highlight: true,
  },
  {
    name: 'Business',
    price: '49',
    period: '/Monat',
    description: 'Für Teams',
    features: [
      'Alles aus Pro',
      'Team-Funktionen',
      'API-Zugang',
      'Custom Integrations',
      'Dedizierter Support',
    ],
    priceId: 'price_1T2X7JAwdEweUSNv895ASmpq',
    highlight: false,
  },
];

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => setProfile(data));
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Pricing Content */}

      <main className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Wähle deinen Plan
            </h1>
            <p className="text-xl text-muted-foreground">
              Flexible Preise für jeden Bedarf
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 ${
                  plan.highlight
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-card border'
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-medium text-primary mb-2">
                    Populär
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">€{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.priceId ? (
                  <CheckoutButton
                    priceId={plan.priceId}
                    planName={plan.name.toLowerCase()}
                    email={user?.email || ''}
                    currentPlan={profile?.subscription_plan}
                  />
                ) : (
                  <Link
                    href={user ? '/dashboard' : '/login'}
                    className="block w-full text-center py-2 px-4 rounded-lg border hover:bg-muted transition"
                  >
                    {user ? 'Aktiviert' : 'Loslegen'}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckoutButton({
  priceId,
  planName,
  email,
  currentPlan,
}: {
  priceId: string;
  planName: string;
  email: string;
  currentPlan?: string;
}) {
  const [loading, setLoading] = useState(false);
  const isCurrentPlan = currentPlan === planName;

  if (isCurrentPlan) {
    return (
      <Link
        href="/dashboard"
        className="block w-full text-center py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
      >
        Aktueller Plan
      </Link>
    );
  }

  const handleCheckout = async () => {
    if (!email) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, priceId, planName }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Fehler beim Checkout');
      }
    } catch (error) {
      alert('Fehler beim Checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
    >
      {loading ? 'Lädt...' : email ? 'Upgrade' : 'Registrieren'}
    </button>
  );
}
