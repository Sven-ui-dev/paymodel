# paymodel.ai - AI Model Preisvergleich

**paymodel.ai** ist der SEO-Magnet und Traffic-Treiber der payclear.ai Suite. Das Produkt ermöglicht Nutzern, LLM-Modelle nach Preis, Performance und Use-Case zu vergleichen.

## Features

- 📊 **Model-Liste**: Tabellarische Übersicht aller verfügbaren Modelle mit Preisen
- 💰 **Preis-Rechner**: Interaktiver Token→Euro Rechner für Eingabemenge
- 🔍 **Provider-Filter**: Filter nach Anbieter (OpenAI, Anthropic, Google, etc.)
- ↔️ **Vergleichs-Funktion**: Side-by-Side Vergleich von 2-3 Modellen
- ❤️ **Favoriten**: Modelle merken für späteren Vergleich
- 🔗 **Affiliate-Links**: Integrierte Weiterleitungslinks zu Providern

## Tech Stack

- **Frontend**: Next.js 15 (React) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Getting Started

### 1. Dependencies installieren

```bash
npm install
```

### 2. Supabase einrichten

1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Führe `supabase/schema.sql` aus (Database Schema)
3. Führe `supabase/seed.sql` aus (Beispieldaten)
4. Kopiere `.env.example` zu `.env.local` und füge deine Supabase Credentials ein

### 3. Development Server starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Projekt-Struktur

```
paymodel-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home Page
│   │   ├── compare/               # Compare Feature
│   │   └── layout.tsx            # Root Layout
│   ├── components/
│   │   ├── ModelList.tsx         # Modelle Tabelle
│   │   ├── PriceCalculator.tsx   # Token Rechner
│   │   ├── SearchFilter.tsx      # Suche & Filter
│   │   └── ui/                    # shadcn/ui Components
│   └── lib/
│       ├── supabase.ts           # Supabase Client & Types
│       └── utils.ts              # Utility Functions
├── supabase/
│   ├── schema.sql                # Database Schema
│   └── seed.sql                  # Beispieldaten
├── .env.example                  # Environment Variables Template
├── package.json
└── tailwind.config.js
```

## Database Schema

- **providers**: AI-Modell-Anbieter (OpenAI, Anthropic, Google, etc.)
- **models**: Verfügbare AI-Modelle
- **prices**: Historische Preise (für Preistracking)
- **use_cases**: Use-Case Kategorien
- **model_use_cases**: Many-to-Many Beziehung
- **users**: Benutzer (später für Accounts)
- **user_favorites**: Gemerkte Modelle

## Deployment

### Vercel (empfohlen)

```bash
npm install -g vercel
vercel
```

### Supabase

1. Supabase CLI installieren
2. `supabase link --project-ref your-project-ref`
3. `supabase db push` für Schema Updates

## Lizenz

MIT License
