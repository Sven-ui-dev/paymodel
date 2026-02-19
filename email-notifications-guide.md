# Email Notifications Guide - paymodel.ai

## Übersicht

Dieses Dokument beschreibt die implementierten Email-Benachrichtigungen für paymodel.ai, die über die Resend API versendet werden.

## Konfiguration

### Umgebungsvariablen

```env
RESEND_API_KEY=re_QtLjRKZ4_5X53bV2gZiqEJXbEno92bn6H
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Absender

- **Email:** `waitlist@paymodel.ai`
- **Name:** `paymodel.ai`

---

## Email-Typen

### 1. Willkommens-Email

**Auslöser:**
- Nach erfolgreicher Checkout-Session (`checkout.session.completed`)
- Bei Upgrade auf Pro/Business

**API Route:** `POST /api/email/welcome`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "Max",
  "planName": "pro" // oder "business"
}
```

**Betreff:** `Willkommen bei paymodel.ai Pro` / `Willkommen bei paymodel.ai Business`

**Inhalt:**
- Willkommensnachricht
- Features-Übersicht (unbegrenzte Transaktionen, erweiterte Analytics, Team-Funktionen, Prioritäts-Support)
- Login-Link zum Dashboard
- Support-Kontakt

---

### 2. Zahlungsbestätigung

**Auslöser:**
- Nach erfolgreicher Stripe-Zahlung
- Bei automatischer Abo-Verlängerung

**API Route:** `POST /api/email/payment-confirmation`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "Max",
  "amount": 2999, // in Cent
  "currency": "eur",
  "planName": "pro",
  "invoiceUrl": "https://pay.stripe.com/invoice/...",
  "invoiceNumber": "INV-2024-0001",
  "paymentDate": "19.02.2026",
  "nextBillingDate": "19.03.2026"
}
```

**Betreff:** `Zahlung erhalten - paymodel.ai`

**Inhalt:**
- Bestätigung der erfolgreichen Zahlung
- Rechnungsdetails (Betrag, Rechnungsnummer, Datum)
- PDF-Download-Link
- Nächste Abrechnungsdatum

---

### 3. Zahlung fehlgeschlagen

**Auslöser:**
- Bei fehlgeschlagener Stripe-Zahlung (`invoice.payment_failed`)

**API Route:** `POST /api/email/payment-failed`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "Max",
  "amount": 2999,
  "currency": "eur",
  "planName": "pro",
  "nextBillingDate": "19.03.2026"
}
```

**Betreff:** `Zahlung fehlgeschlagen - paymodel.ai`

**Inhalt:**
- Information über die fehlgeschlagene Zahlung
- Erklärung der Situation (Abo pausiert)
- Handlungsaufforderung (Zahlungsinformationen aktualisieren)
- Dashboard-Link zur Aktualisierung
- Support-Kontakt

---

### 4. Abo erneuert

**Auslöser:**
- Bei erfolgreicher automatischer Abo-Verlängerung
- Nach `customer.subscription.updated` Event (wenn Status von `past_due` zu `active` wechselt)

**API Route:** `POST /api/email/subscription-renewed`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "Max",
  "amount": 2999,
  "currency": "eur",
  "planName": "pro",
  "currentPeriodEnd": "19.03.2026",
  "nextBillingDate": "19.04.2026"
}
```

**Betreff:** `Abo erneuert - paymodel.ai`

**Inhalt:**
- Bestätigung der erfolgreichen Erneuerung
- Abo-Details (Plan, Betrag, Gültigkeitsdatum)
- Nächste Erneuerungsdatum
- Dashboard-Link

---

## Webhook Integration

### Stripe Events

Die Email-Benachrichtigungen werden automatisch über Stripe Webhooks versendet:

| Stripe Event | Email-Typ |
|-------------|-----------|
| `checkout.session.completed` | Willkommens-Email + Zahlungsbestätigung |
| `invoice.payment_failed` | Zahlung fehlgeschlagen Email |
| `customer.subscription.updated` | Abo erneuert Email |

### Webhook Route

`POST /api/stripe/webhook`

**Wichtig:** Der Stripe Webhook Secret muss in den Umgebungsvariablen konfiguriert sein:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Entwicklung & Testing

### Lokales Testen

```bash
# Start den Development Server
npm run dev

# Teste Willkommens-Email
curl -X POST http://localhost:3000/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","planName":"pro"}'

# Teste Zahlungsbestätigung
curl -X POST http://localhost:3000/api/email/payment-confirmation \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","amount":2999,"planName":"pro","invoiceUrl":"https://pay.stripe.com/invoice/xxx","invoiceNumber":"INV-001","nextBillingDate":"19.03.2026"}'
```

### Stripe CLI für Webhook Testing

```bash
# Webhook forwarden
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Events triggern (z.B. Checkout)
stripe trigger checkout.session.completed
```

---

## Technische Details

### Verwendete Dependencies

- `resend`: ^6.9.2
- `next`: ^16.1.6
- `stripe`: ^20.3.1

### Dateistruktur

```
src/
├── app/
│   └── api/
│       ├── email/
│       │   ├── welcome/
│       │   │   └── route.ts
│       │   ├── payment-confirmation/
│       │   │   └── route.ts
│       │   ├── payment-failed/
│       │   │   └── route.ts
│       │   └── subscription-renewed/
│       │       └── route.ts
│       └── stripe/
│           └── webhook/
│               └── route.ts
└── components/
    └── email/
        ├── index.ts
        ├── WelcomeEmail.tsx
        ├── PaymentConfirmationEmail.tsx
        ├── PaymentFailedEmail.tsx
        └── SubscriptionRenewedEmail.tsx
```

### Email-Templates

Alle Emails werden als Responsive HTML-Templates versendet, die auf allen Geräten gut lesbar sind. Zusätzlich wird eine Text-Version für Email-Clients ohne HTML-Support bereitgestellt.

---

## Troubleshooting

### Email wird nicht gesendet

1. **API Key prüfen:** Stelle sicher, dass `RESEND_API_KEY` korrekt in `.env.local` gesetzt ist.
2. **Supabase Auth:** Bei Webhook-Events wird die Email aus dem Supabase Profile gelesen. Prüfe, ob das Profile existiert.
3. **Logs prüfen:** Alle Email-Versuche werden in der Konsole geloggt (`console.log`).

### Styling-Probleme

Die Templates verwenden inline CSS für maximale Kompatibilität mit verschiedenen Email-Clients. Falls Anpassungen nötig sind, bearbeite die entsprechende Komponente in `src/components/email/`.

---

## Support

Bei Fragen oder Problemen:
- Email: support@paymodel.ai
- Dev-Kanal: Slack #development
