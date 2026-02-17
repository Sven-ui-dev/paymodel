'use client';

import { useState } from 'react';
import { PRICING_TIERS, isTestMode } from '@/lib/stripe';
import CheckoutForm from '@/components/Checkout';

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = useState<'free' | 'pro' | 'team' | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSelectTier = (tier: 'free' | 'pro' | 'team') => {
    if (tier === 'free') {
      // Free tier - no payment needed
      alert('Du hast den Free Tier ausgewählt! Keine Zahlung erforderlich.');
      return;
    }
    setSelectedTier(tier);
    setShowCheckout(true);
  };

  const handleSuccess = () => {
    alert('Zahlung erfolgreich! Willkommen beim ' + PRICING_TIERS[selectedTier!].name + ' Plan.');
    setShowCheckout(false);
    setSelectedTier(null);
  };

  const handleCancel = () => {
    setShowCheckout(false);
    setSelectedTier(null);
  };

  if (showCheckout && selectedTier) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Test Mode Banner */}
          {isTestMode && (
            <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧪</span>
                <div>
                  <h2 className="font-bold text-yellow-800">Stripe Sandbox aktiv</h2>
                  <p className="text-yellow-700 text-sm">
                    Test-Modus - keine echten Zahlungen werden verarbeitet
                  </p>
                </div>
              </div>
            </div>
          )}

          <CheckoutForm
            tier={selectedTier}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="max-w-6xl mx-auto mb-8 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧪</span>
            <span className="font-bold text-yellow-800">Stripe Sandbox aktiv</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Wähle deinen Plan
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Einfache, transparente Preisgestaltung für deine Anforderungen
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {PRICING_TIERS.free.name}
            </h3>
            <p className="text-4xl font-bold text-blue-600 mb-6">
              €0<span className="text-base font-normal text-gray-500">/Monat</span>
            </p>
            <ul className="space-y-3 mb-8">
              {PRICING_TIERS.free.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectTier('free')}
              className="w-full py-3 px-4 bg-gray-200 text-gray-900 font-semibold rounded-md hover:bg-gray-300 transition"
            >
              Aktueller Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-blue-500 transform scale-105">
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              BELIEBT
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {PRICING_TIERS.pro.name}
            </h3>
            <p className="text-4xl font-bold text-blue-600 mb-6">
              €{(PRICING_TIERS.pro.price / 100).toFixed(0)}<span className="text-base font-normal text-gray-500">/Monat</span>
            </p>
            <ul className="space-y-3 mb-8">
              {PRICING_TIERS.pro.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectTier('pro')}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Upgrade zu Pro
            </button>
          </div>

          {/* Team Tier */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {PRICING_TIERS.team.name}
            </h3>
            <p className="text-4xl font-bold text-blue-600 mb-6">
              €{(PRICING_TIERS.team.price / 100).toFixed(0)}<span className="text-base font-normal text-gray-500">/Monat</span>
            </p>
            <ul className="space-y-3 mb-8">
              {PRICING_TIERS.team.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectTier('team')}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Upgrade zu Team
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-8 text-sm">
          Alle Preise in EUR. Jederzeit kündbar.
        </p>
      </div>
    </div>
  );
}
