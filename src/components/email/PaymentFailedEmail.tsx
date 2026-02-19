import React from 'react';

interface PaymentFailedEmailProps {
  firstName?: string;
  amount: number;
  currency: string;
  planName: string;
  nextBillingDate: string;
  dashboardUrl: string;
  supportUrl: string;
}

export function generatePaymentFailedEmailContent({
  firstName = 'there',
  amount,
  currency = 'eur',
  planName,
  nextBillingDate,
  dashboardUrl,
  supportUrl,
}: PaymentFailedEmailProps): { subject: string; html: string; text: string } {
  const subject = `Zahlung fehlgeschlagen - paymodel.ai`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zahlung fehlgeschlagen - paymodel.ai</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #ef4444; padding: 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Zahlung fehlgeschlagen</h1>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px;">Hallo ${firstName},</h2>
              
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Leider konnte die letzte Zahlung für dein <strong>${planName}-Abo</strong> nicht verarbeitet werden.
              </p>

              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #dc2626; font-size: 14px; margin: 0 0 10px; font-weight: 600;">
                  📌 Was bedeutet das?
                </p>
                <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.6;">
                  Dein Abo ist vorübergehend pausiert, bis die Zahlung erfolgreich verarbeitet wird. 
                  Bitte aktualisiere deine Zahlungsinformationen so schnell wie möglich, um Unterbrechungen zu vermeiden.
                </p>
              </div>

              <!-- Payment Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Betrag:</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">${(amount / 100).toFixed(2).replace('.', ',')} ${currency.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Nächster Versuch:</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">${nextBillingDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 30px;">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Zahlungsinformationen aktualisieren 💳
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">

              <p style="color: #4a4a4a; font-size: 14px; line-height: 1.5; margin: 0 0 10px;">
                Falls du Hilfe bei der Aktualisierung deiner Zahlungsinformationen benötigst oder Fragen hast:
              </p>
              <p style="color: #1a1a1a; font-size: 14px; margin: 0;">
                📧 <a href="${supportUrl}" style="color: #1a1a1a;">support@paymodel.ai</a>
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
                Du hast diese E-Mail erhalten, weil eine Zahlung für dein paymodel.ai Abo fehlgeschlagen ist.
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
Zahlung fehlgeschlagen - paymodel.ai

Hallo ${firstName},

Leider konnte die letzte Zahlung für dein ${planName}-Abo nicht verarbeitet werden.

Betrag: ${(amount / 100).toFixed(2).replace('.', ',')} ${currency.toUpperCase()}
Nächster Versuch: ${nextBillingDate}

Dein Abo ist vorübergehend pausiert. Bitte aktualisiere deine Zahlungsinformationen:
${dashboardUrl}

Falls du Hilfe benötigst:
📧 support@paymodel.ai

© 2024 paymodel.ai
  `;

  return { subject, html, text };
}

export type { PaymentFailedEmailProps };
