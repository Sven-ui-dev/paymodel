import React from 'react';

interface SubscriptionRenewedEmailProps {
  firstName?: string;
  amount: number;
  currency: string;
  planName: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  dashboardUrl: string;
}

export function generateSubscriptionRenewedEmailContent({
  firstName = 'there',
  amount,
  currency = 'eur',
  planName,
  currentPeriodEnd,
  nextBillingDate,
  dashboardUrl,
}: SubscriptionRenewedEmailProps): { subject: string; html: string; text: string } {
  const subject = `Abo erneuert - paymodel.ai`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abo erneuert - paymodel.ai</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #3b82f6; padding: 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🔄</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Abo erneuert!</h1>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px;">Hallo ${firstName}!</h2>
              
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Gute Nachrichten! Dein <strong>${planName}-Abo</strong> wurde erfolgreich erneuert. 
                Wir danken dir für deine Treue! 🙏
              </p>

              <!-- Subscription Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Abo-Plan:</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">${planName === 'business' ? 'Business' : 'Pro'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Abrechnungsbetrag:</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">${(amount / 100).toFixed(2).replace('.', ',')} ${currency.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Gültig bis:</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">${currentPeriodEnd}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Nächste Erneuerung:</td>
                        <td style="padding: 8px 0; color: #10b981; font-size: 14px; text-align: right; font-weight: 600;">${nextBillingDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #1e40af; font-size: 14px; margin: 0; line-height: 1.6;">
                  💡 <strong>Tipp:</strong> Du kannst deine Abo-Einstellungen jederzeit in deinem Dashboard anpassen 
                  oder kündigen. Wir möchten sicherstellen, dass du die bestmögliche Erfahrung mit paymodel.ai hast.
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 30px;">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Zum Dashboard →
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">

              <p style="color: #4a4a4a; font-size: 14px; line-height: 1.5; margin: 0;">
                Falls du Fragen zu deinem Abo hast oder Hilfe benötigst:
              </p>
              <p style="color: #1a1a1a; font-size: 14px; margin: 10px 0 0;">
                📧 <a href="mailto:support@paymodel.ai" style="color: #1a1a1a;">support@paymodel.ai</a>
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px 30px; text-align: center;">
              <p style="color: #8a8a8a; font-size: 12px; margin: 0;">
                © 2024 paymodel.ai. Alle Rechte vorbehalten.
              </p>
              <p style="color: #8a8a8a; font-size: 12px; margin: 10px 0 0;">
                Du hast diese E-Mail erhalten, weil dein paymodel.ai Abo automatisch erneuert wurde.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Abo erneuert - paymodel.ai

Hallo ${firstName}!

Gute Nachrichten! Dein ${planName}-Abo wurde erfolgreich erneuert.

Abo-Details:
- Abo-Plan: ${planName === 'business' ? 'Business' : 'Pro'}
- Abrechnungsbetrag: ${(amount / 100).toFixed(2).replace('.', ',')} ${currency.toUpperCase()}
- Gültig bis: ${currentPeriodEnd}
- Nächste Erneuerung: ${nextBillingDate}

Zum Dashboard: ${dashboardUrl}

© 2024 paymodel.ai
  `;

  return { subject, html, text };
}

export type { SubscriptionRenewedEmailProps };
