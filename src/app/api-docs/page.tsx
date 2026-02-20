"use client";

import { Navbar } from "@/components/ui-extended/Navbar";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ApiDocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const EndpointCard = ({
    method,
    path,
    description,
    id,
    example,
  }: {
    method: string;
    path: string;
    description: string;
    id: string;
    example: string;
  }) => (
    <Card className="mb-6" id={id}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={
              method === "GET"
                ? "bg-green-500/10 text-green-600 border-green-500"
                : "bg-blue-500/10 text-blue-600 border-blue-500"
            }
          >
            {method}
          </Badge>
          <code className="text-sm font-mono">{path}</code>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Example Request:</h4>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{example}</code>
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(example, id)}
              >
                {copiedId === id ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">API Dokumentation</h1>
          <p className="text-muted-foreground text-lg">
            Integriere paymodel.ai in deine Anwendungen mit unserer leistungsstarken API.
          </p>
        </div>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Authentifizierung</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                Alle API-Anfragen erfordern einen API-Key im Authorization-Header:
              </p>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>Authorization: Bearer pk_your_api_key</code>
                </pre>
              </div>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-sm">
                  💡 API-Keys sind nur für Business-Abonnenten verfügbar.
                  Generiere deine Keys im Dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Models Endpoint */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Modelle</h2>

          <EndpointCard
            method="GET"
            path="/api/v1/models"
            description="Liste alle verfügbaren AI-Modelle mit Preisen und Spezifikationen auf."
            id="models-list"
            example={`curl -X GET "https://paymodel.ai/api/v1/models?provider=openai&limit=10" \\
  -H "Authorization: Bearer pk_your_api_key"`}
          />

          <h3 className="text-lg font-semibold mb-2 mt-8">Query-Parameter:</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Parameter</th>
                  <th className="text-left py-2 px-4">Typ</th>
                  <th className="text-left py-2 px-4">Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">provider</td>
                  <td className="py-2 px-4">string</td>
                  <td className="py-2 px-4">Filter nach Provider (z.B. "openai", "anthropic")</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">capabilities</td>
                  <td className="py-2 px-4">string</td>
                  <td className="py-2 px-4">Filter nach Fähigkeiten (z.B. "coding", "vision")</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">min_context</td>
                  <td className="py-2 px-4">number</td>
                  <td className="py-2 px-4">Minimale Context-Fenster Größe</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">limit</td>
                  <td className="py-2 px-4">number</td>
                  <td className="py-2 px-4">Anzahl der Ergebnisse (Standard: 100)</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-xs">offset</td>
                  <td className="py-2 px-4">number</td>
                  <td className="py-2 px-4">Offset für Pagination (Standard: 0)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mb-2">Response-Beispiel:</h3>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`{
  "models": [
    {
      "model_name": "gpt-4o",
      "model_slug": "gpt-4o",
      "provider_name": "OpenAI",
      "provider_slug": "openai",
      "input_price_per_million": 2.5,
      "output_price_per_million": 10.0,
      "currency": "EUR",
      "context_window": 128000,
      "capabilities": ["text", "vision", "coding"]
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "count": 1
  }
}`}</code>
            </pre>
          </div>
        </section>

        {/* Compare Endpoint */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Preise vergleichen</h2>

          <EndpointCard
            method="POST"
            path="/api/v1/compare"
            description="Vergleiche die Preise mehrerer Modelle für einen definierten Token-Einsatz."
            id="compare"
            example={`curl -X POST "https://paymodel.ai/api/v1/compare" \\
  -H "Authorization: Bearer pk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "models": ["gpt-4o", "claude-sonnet-4"],
    "input_tokens": 10000,
    "output_tokens": 5000
  }'`}
          />

          <h3 className="text-lg font-semibold mb-2 mt-8">Request-Body:</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Feld</th>
                  <th className="text-left py-2 px-4">Typ</th>
                  <th className="text-left py-2 px-4">Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">models</td>
                  <td className="py-2 px-4">array</td>
                  <td className="py-2 px-4">Array von Model-Slugs</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">input_tokens</td>
                  <td className="py-2 px-4">number</td>
                  <td className="py-2 px-4">Anzahl Input-Tokens</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-xs">output_tokens</td>
                  <td className="py-2 px-4">number</td>
                  <td className="py-2 px-4">Anzahl Output-Tokens</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Calculate Endpoint */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Kosten berechnen</h2>

          <EndpointCard
            method="POST"
            path="/api/v1/calculate"
            description="Berechne die Kosten für ein einzelnes Modell mit flexiblen Token-Parametern."
            id="calculate"
            example={`curl -X POST "https://paymodel.ai/api/v1/calculate" \\
  -H "Authorization: Bearer pk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "monthly_input": 500000,
    "monthly_output": 250000
  }'`}
          />

          <h3 className="text-lg font-semibold mb-2 mt-8">Request-Body:</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Feld</th>
                  <th className="text-left py-2 px-4">Typ</th>
                  <th className="text-left py-2 px-4">Beschreibung</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">model</td>
                  <td className="py-2 px-4">string</td>
                  <td className="py-2 px-4">Model-Slug</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">input_tokens</td>
                  <td className="py-2 px-4">number</td>
                  <td className="py-2 px-4">Einmalige Input-Tokens</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">output_tokens</td>
                  <td className="py-2 px-4">number</td>
                  <td className="py-2 px-4">Einmalige Output-Tokens</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono text-xs">monthly_input</td>
                  <td className="py-2 px-4">number</td>
                  <td className="py-2 px-4">Monatliche Input-Tokens</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono text-xs">monthly_output</td>
                  <td className="py-2 px-4">number</td>
                  <td className="py-2 px-4">Monatliche Output-Tokens</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SDKs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">SDKs</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">JavaScript / TypeScript</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  npm install @paymodel/sdk
                </p>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{`import { PaymodelClient } from '@paymodel/sdk';

const client = new PaymodelClient({
  apiKey: process.env.PAYMODEL_API_KEY
});

const models = await client.models.list({
  provider: 'openai'
});`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Python</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  pip install paymodel-sdk
                </p>
                <div className="relative">
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{`from paymodel import PaymodelClient

client = PaymodelClient(api_key="pk_...")

models = client.models.list(
  provider="openai"
)`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Help */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Hilfe & Support</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                Bei Fragen oder Problemen mit der API:
              </p>
              <ul className="space-y-2 text-sm">
                <li>📧 E-Mail: <a href="mailto:support@paymodel.ai" className="text-primary hover:underline">support@paymodel.ai</a></li>
                <li>📖 Dokumentation: <Link href="/docs" className="text-primary hover:underline">docs.paymodel.ai</Link></li>
                <li>💬 Discord: <a href="https://discord.gg/paymodel" className="text-primary hover:underline">discord.gg/paymodel</a></li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 paymodel.ai – Alle Rechte vorbehalten.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/impressum" className="hover:text-foreground">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
