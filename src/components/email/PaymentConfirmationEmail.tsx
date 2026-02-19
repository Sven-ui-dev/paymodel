import React from 'react';

interface PaymentConfirmationEmailProps {
  firstName?: string;
  amount: number;
  currency: string;
  planName: string;
  invoiceUrl: string;
  invoiceNumber: string;
  paymentDate: string;
  nextBillingDate: string;
}

export function generatePaymentConfirmationEmailContent({
  firstName = 'there',
  amount,
  currency = 'eur',
  planName,
  invoiceUrl,
  invoiceNumber,
  paymentDate,
  nextBillingDate,
}: PaymentConfirmationEmailProps): { subject: string; html: string; text: string } {
  const subject = `Zahlung erhalten - paymodel.ai`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zahlungsbestätigung - paymodel.ai</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #10b981; padding: 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Zahlung erhalten!</h1>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px;">Vielen Dank, ${firstName}!</h2>
              
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Wir haben deine Zahlung erfolgreich erhalten. Dein ${planName}-Abo ist jetzt aktiv.
              </p>

              <!-- Invoice Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Rechnungsnummer:</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">${invoiceNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Betrag:</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">${(amount / 100).toFixed(2).replace('.', ',')} ${currency.toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Zahlungsdatum:</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; text-align: right; font-weight: 600;">${paymentDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #4a4a4a; font-size: 14px;">Nächste Abrechnung:</td>
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
                    <a href="${invoiceUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Rechnung herunterladen 📄
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">

              <p style="color: #4a4a4a; font-size: 14px; line-height: 1.5; margin: 0;">
                Du kannst deine Rechnung auch jederzeit in deinem <a href="${invoiceUrl}" style="color: #10b981;">Dashboard</a> einsehen.
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
                Du hast diese E-Mail erhalten, weil eine Zahlung für dein paymodel.ai Abo eingegangen ist.
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
Zahlungsbestätigung - paymodel.ai

Hallo ${firstName},

Wir haben deine Zahlung erfolgreich erhalten! Dein ${planName}-Abo ist jetzt aktiv.

Rechnungsdetails:
- Rechnungsnummer: ${invoiceNumber}
- Betrag: ${(amount / 100).toFixed(2).replace('.', ',')} ${currency.toUpperCase()}
- Zahlungsdatum: ${paymentDate}
- Nächste Abrechnung: ${nextBillingDate}

Lade deine Rechnung herunter: ${invoiceUrl}

© 2024 paymodel.ai
  `;

  return { subject, html, text };
}

export type { PaymentConfirmationEmailProps };
