'use client';

import Link from 'next/link';
import { isTestMode } from '@/lib/stripe';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Test Mode Banner */}
        {isTestMode && (
          <div className="mb-6 p-3 bg-yellow-100 border border-yellow-400 rounded-md">
            <p className="text-yellow-800 text-sm font-medium">🧪 Test-Modus</p>
          </div>
        )}

        <div className="mb-6">
          <span className="text-6xl">✅</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Zahlung erfolgreich!
        </h1>

        <p className="text-gray-600 mb-8">
          Vielen Dank für deinen Kauf. Dein Plan wurde aktiviert.
        </p>

        <div className="space-y-4">
          <Link
            href="/pricing"
            className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Zurück zur Pricing Seite
          </Link>

          <Link
            href="/"
            className="block w-full py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition"
          >
            Zur Startseite
          </Link>
        </div>

        {/* Test Info */}
        {isTestMode && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm">
              💡 Im Test-Modus wurde keine echte Zahlung verarbeitet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
