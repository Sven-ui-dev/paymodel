import { html, text } from './index';

export type PriceAlertEmailProps = {
  modelName: string;
  providerName: string;
  targetPrice: number;
  currentPrice: number;
  modelSlug: string;
  userEmail?: string;
};

export function generatePriceAlertEmailContent({
  modelName,
  providerName,
  targetPrice,
  currentPrice,
  modelSlug,
}: PriceAlertEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paymodel.ai';
  const modelUrl = `${appUrl}/compare?model=${modelSlug}`;
  const priceDrop = targetPrice - currentPrice;
  const percentageDrop = ((priceDrop / targetPrice) * 100).toFixed(1);

  const subject = `Preis-Alert: ${modelName} ist unter deinem Zielpreis!`;

  const htmlContent = html`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preis-Alert</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="background-color: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
          🔔 Preis-Alert
        </span>
      </div>

      <h1 style="color: #1a1a1a; text-align: center; margin-bottom: 10px; font-size: 24px;">
        ${modelName} ist unter deinem Zielpreis!
      </h1>

      <p style="color: #666; text-align: center; margin-bottom: 30px;">
        von ${providerName}
      </p>

      <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="color: #166534; font-size: 14px; margin: 0 0 4px 0;">Dein Zielpreis</p>
            <p style="color: #166534; font-size: 24px; font-weight: bold; margin: 0;">
              ${targetPrice.toFixed(2)} €
            </p>
          </div>
          <div style="color: #22c55e; font-size: 24px;">→</div>
          <div>
            <p style="color: #166534; font-size: 14px; margin: 0 0 4px 0;">Aktueller Preis</p>
            <p style="color: #22c55e; font-size: 24px; font-weight: bold; margin: 0;">
              ${currentPrice.toFixed(2)} €
            </p>
          </div>
        </div>
        <p style="color: #22c55e; font-weight: 600; margin: 16px 0 0 0;">
          ↓ ${percentageDrop}% günstiger als dein Zielpreis!
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${modelUrl}"
           style="display: inline-block; background-color: #1a1a1a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 20px;">
          Zum Modell →
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">

      <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
        Du erhältst diese E-Mail, weil du einen Preis-Alert für ${modelName} erstellt hast.<br>
        <a href="${appUrl}/dashboard" style="color: #666;">Verwalte deine Alerts</a> ·
        <a href="${appUrl}/unsubscribe" style="color: #666;">Abbestellen</a>
      </p>
    </div>
  </body>
</html>
  `.trim();

  const textContent = text`
Preis-Alert: ${modelName} ist unter deinem Zielpreis!

Hallo,

Gute Nachrichten! ${modelName} von ${providerName} ist jetzt zu einem günstigeren Preis verfügbar.

Dein Zielpreis: ${targetPrice.toFixed(2)} €
Aktueller Preis: ${currentPrice.toFixed(2)} €
Preisunterschied: ${percentageDrop}% günstiger!

Zum Modell: ${modelUrl}

---
Du erhältst diese E-Mail, weil du einen Preis-Alert erstellt hast.
Verwalte deine Alerts: ${appUrl}/dashboard
  `.trim();

  return { subject, html: htmlContent, text: textContent };
}
