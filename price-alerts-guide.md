# Price Alerts Feature - Dokumentation

## Übersicht

Das **Price Alerts Feature** ermöglicht es Benutzern, Preis-Warnungen für AI-Modelle zu erstellen. Wenn der Preis eines Modells unter den festgelegten Zielpreis fällt, erhalten sie eine E-Mail-Benachrichtigung.

---

## Features

- ✅ Preis-Alert erstellen direkt aus der Modell-Liste
- ✅ E-Mail-Benachrichtigung bei Preisunterschreitung
- ✅ Übersicht aller aktiven Alerts im Dashboard
- ✅ Alerts löschen/deaktivieren
- ✅ Tägliche automatische Preisprüfung via Cron Job

---

## Datenbank-Schema

### Tabelle: `price_alerts`

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | UUID | Primärschlüssel |
| `user_id` | UUID | Fremdschlüssel zu `users` |
| `model_id` | UUID | Fremdschlüssel zu `models` |
| `target_price` | DECIMAL(10,4) | Zielpreis in €/M Tokens |
| `current_price` | DECIMAL(10,4) | Aktueller Preis (bei Erstellung) |
| `is_active` | BOOLEAN | Ist der Alert aktiv? |
| `is_triggered` | BOOLEAN | Wurde der Alert bereits ausgelöst? |
| `created_at` | TIMESTAMP | Erstellungszeitpunkt |
| `triggered_at` | TIMESTAMP | Auslösungszeitpunkt |

### View: `active_price_alerts`

Eine praktische View für das Abrufen von Alerts mit Modell-Details:

```sql
SELECT 
  pa.id as alert_id,
  pa.user_id,
  pa.model_id,
  pa.target_price,
  pa.current_price,
  pa.is_active,
  pa.is_triggered,
  pa.created_at,
  pa.triggered_at,
  m.name as model_name,
  m.slug as model_slug,
  p.name as provider_name,
  p.slug as provider_slug
FROM price_alerts pa
JOIN models m ON pa.model_id = m.id
JOIN providers p ON m.provider_id = p.id
WHERE pa.is_active = true;
```

---

## API Routes

### 1. Alert erstellen

**Endpoint:** `POST /api/alerts/create`

**Request Body:**
```json
{
  "user_id": "uuid-xxx",
  "model_id": "uuid-yyy",
  "target_price": 0.50,
  "current_price": 0.75
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid-alert",
    "user_id": "uuid-xxx",
    "model_id": "uuid-yyy",
    "target_price": 0.50,
    "current_price": 0.75,
    "is_active": true,
    "is_triggered": false,
    "created_at": "2026-02-19T..."
  }
}
```

### 2. Alerts abrufen

**Endpoint:** `GET /api/alerts/list?user_id=uuid-xxx`

**Response (200):**
```json
{
  "data": [
    {
      "alert_id": "uuid-alert",
      "model_name": "GPT-4o",
      "provider_name": "OpenAI",
      "target_price": 0.50,
      "current_price": 0.75,
      "is_active": true,
      "is_triggered": false,
      "created_at": "2026-02-19T..."
    }
  ]
}
```

### 3. Alert löschen

**Endpoint:** `DELETE /api/alerts/delete/[id]?user_id=uuid-xxx`

**Response (200):**
```json
{
  "success": true
}
```

### 4. Cron Job - Preisprüfung

**Endpoint:** `POST /api/alerts/cron/check`

Wird täglich um 9:00 Uhr ausgeführt (konfiguriert in `vercel.json`).

---

## Frontend Integration

### Modell-Liste mit Preis-Alert Button

```tsx
import { ModelList } from "@/components/ModelList";

<ModelList 
  models={models} 
  userId={userId}
  onFavorite={handleFavorite}
/>
```

### Preis-Alerts im Dashboard

```tsx
import { PriceAlertsList } from "@/components/PriceAlertsList";

<PriceAlertsList userId={userId} />
```

---

## Cron Job Setup

### Vercel

Die Cron Job Konfiguration ist in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/alerts/cron/check",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Aktivierung auf Vercel:**
1. Deploy auf Vercel
2. Gehe zu Settings → Cron Jobs
3. Aktiviere den `daily-price-check` Cron Job

### Alternative: Supabase Edge Functions

Falls Supabase Edge Functions bevorzugt werden:

```sql
-- Supabase Database Webhook für tägliche Ausführung
-- Konfiguriere einen Database Webhook, der aufruft:
-- https://your-project.supabase.co/functions/v1/check-price-alerts
```

---

## E-Mail Template

**Betreff:** `Preis-Alert: [Modellname] ist unter deinem Zielpreis!`

**Inhalt:**
- Modellname und Provider
- Zielpreis vs. Aktueller Preis (als visueller Vergleich)
- Prozentualer Preisunterschied
- Link zum Modell
- Link zur Alert-Verwaltung im Dashboard
- Unsubscribe-Link

---

## Umgebungsvariablen

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Resend (für E-Mails)
RESEND_API_KEY=re_your-resend-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Datenbank-Setup ausführen

```bash
# 1. Verbinde dich mit Supabase
psql "postgresql://user:password@host:5432/db" -f supabase/price_alerts_schema.sql

# Oder führe das SQL direkt im Supabase SQL Editor aus
```

---

## Testing

### Lokal testen

```bash
# Cron Job manuell auslösen
curl -X POST http://localhost:3000/api/alerts/cron/check

# Alert erstellen
curl -X POST http://localhost:3000/api/alerts/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your-user-id",
    "model_id": "your-model-id",
    "target_price": 0.50,
    "current_price": 0.75
  }'

# Alerts abrufen
curl "http://localhost:3000/api/alerts/list?user_id=your-user-id"

# Alert löschen
curl -X DELETE "http://localhost:3000/api/alerts/delete/alert-id?user_id=your-user-id"
```

---

## Troubleshooting

### Alert wird nicht ausgelöst

1. Prüfe ob der Alert `is_active = true` und `is_triggered = false` hat
2. Prüfe die `prices` Tabelle für das Modell
3. Prüfe die Cron Job Logs

### E-Mail wird nicht gesendet

1. Prüfe den Resend API Key
2. Prüfe ob die E-Mail-Adresse im User-Profile existiert
3. Prüfe die Resend Console auf Fehler

---

## Dateistruktur

```
paymodel-ai/
├── supabase/
│   └── price_alerts_schema.sql      # SQL Schema
├── src/
│   ├── app/
│   │   └── api/
│   │       └── alerts/
│   │           ├── create/
│   │           │   └── route.ts      # POST /api/alerts/create
│   │           ├── list/
│   │           │   └── route.ts      # GET /api/alerts/list
│   │           ├── delete/
│   │           │   └── [id]/
│   │           │       └── route.ts  # DELETE /api/alerts/delete/[id]
│   │           └── cron/
│   │               └── check/
│   │                   └── route.ts  # POST /api/alerts/cron/check
│   └── components/
│       ├── CreatePriceAlertModal.tsx  # Modal zum Erstellen
│       ├── PriceAlertsList.tsx        # Liste im Dashboard
│       └── ModelList.tsx               # Erweitert mit Alert-Button
├── vercel.json                        # Cron Job Konfiguration
└── price-alerts-guide.md             # Diese Dokumentation
```

---

## Support

Bei Fragen oder Problemen:
- Dev-Kanal: Slack #development
- Email: dev@paymodel.ai
