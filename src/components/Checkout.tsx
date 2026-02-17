'use client';

import { useState } from 'react';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY, isTestMode, PRICING_TIERS } from '@/lib/stripe';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  tier: 'free' | 'pro' | 'team';
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutFormInner({ tier, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tierInfo = PRICING_TIERS[tier];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      setErrorMessage(error.message || 'Ein Fehler ist aufgetreten');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 font-bold">🧪</span>
            <span className="text-yellow-800 font-medium">Stripe Sandbox aktiv</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Keine echten Zahlungen - Test-Modus
          </p>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">
        {tierInfo.name} Plan Upgrade
      </h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <p className="text-gray-600">Preis:</p>
        <p className="text-3xl font-bold text-blue-600">
          {tierInfo.price === 0 ? 'Kostenlos' : `€${(tierInfo.price / 100).toFixed(2)}/Monat`}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <PaymentElement />

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-md">
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isProcessing ? 'Wird verarbeitet...' : 'Jetzt zahlen'}
          </button>
        </div>
      </form>

      {/* Test Cards Info */}
      {isTestMode && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-800 font-medium text-sm">💳 Test-Karten:</p>
          <p className="text-blue-700 text-xs mt-1">
            4242 4242 4242 4242 (erfolgreich)<br />
            4000 0000 0000 9995 (fehlgeschlagen)
          </p>
        </div>
      )}
    </div>
  );
}

export default function CheckoutForm(props: CheckoutFormProps) {
  const options = {
    mode: 'payment' as const,
    amount: PRICING_TIERS[props.tier].price,
    currency: 'eur',
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutFormInner {...props} />
    </Elements>
  );
}

export { stripePromise };
