import { createClient } from '@/lib/supabase/server';
import { Check } from 'lucide-react';
import Link from 'next/link';

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
    priceId: 'price_1T2UBVAwdEweUSNveqIRiSE2',
    highlight: true,
  },
  {
    name: 'Business',
    price: '29',
    period: '/Monat',
    description: 'Für Teams',
    features: [
      'Alles aus Pro',
      'Team-Funktionen',
      'API-Zugang',
      'Custom Integrations',
      'Dedizierter Support',
    ],
    priceId: 'price_1T2UFEAwdEweUSNvkKOoPJSQ',
    highlight: false,
  },
];

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get user profile if logged in
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">
              paymodel.ai
            </Link>
            <nav className="flex items-center gap-4">
              {user ? (
                <Link href="/dashboard" className="text-sm font-medium">
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" className="text-sm font-medium">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

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

  return (
    <form action="/api/stripe/checkout" method="POST">
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="priceId" value={priceId} />
      <input type="hidden" name="planName" value={planName} />
      <button
        type="submit"
        className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
      >
        {email ? 'Upgrade' : 'Registrieren'}
      </button>
    </form>
  );
}
