import React from 'react';

interface WelcomeEmailProps {
  firstName?: string;
  planName: 'pro' | 'business';
  loginUrl: string;
  supportUrl: string;
}

export function generateWelcomeEmailContent({
  firstName = 'there',
  planName,
  loginUrl,
  supportUrl,
}: WelcomeEmailProps): { subject: string; html: string; text: string } {
  const subject = `Willkommen bei paymodel.ai ${planName === 'business' ? 'Business' : 'Pro'}`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Willkommen bei paymodel.ai</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <!-- Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🚀 paymodel.ai</h1>
            </td>
          </tr>
        </table>

        <!-- Content -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 24px;">Willkommen an Bord, ${firstName}! 🎉</h2>
              
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Vielen Dank für deine Anmeldung bei <strong>paymodel.ai ${planName === 'business' ? 'Business' : 'Pro'}</strong>! 
                Wir freuen uns sehr, dich dabei zu haben.
              </p>

              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                Mit deinem neuen ${planName === 'business' ? 'Business' : 'Pro'}-Plan hast du jetzt Zugang zu allen Premium-Features:
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                    <ul style="margin: 0; padding-left: 20px; color: #4a4a4a; font-size: 14px; line-height: 2;">
                      <li>💳 <strong>Unbegrenzte Transaktionen</strong> - Keine Limits mehr</li>
                      <li>📊 <strong>Erweiterte Analytics</strong> - Detaillierte Auswertungen</li>
                      <li>👥 <strong>Team-Funktionen</strong> - Zusammenarbeit leicht gemacht</li>
                      <li>🎯 <strong>Prioritäts-Support</strong> - Schnelle Hilfe wenn du sie brauchst</li>
                      ${planName === 'business' ? '<li>🏢 <strong>Business-Features</strong> - Erweiterte Rechteverwaltung & API-Zugang</li>' : ''}
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="text-align: center; padding-bottom: 30px;">
                    <a href="${loginUrl}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Jetzt loslegen →
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">

              <p style="color: #8a8a8a; font-size: 14px; line-height: 1.5; margin: 0;">
                Falls du Fragen hast oder Hilfe brauchst, sind wir jederzeit für dich da:
              </p>
              <p style="color: #1a1a1a; font-size: 14px; margin: 10px 0 0;">
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
                Du hast diese E-Mail erhalten, weil du dich bei paymodel.ai angemeldet hast.
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
Willkommen bei paymodel.ai ${planName === 'business' ? 'Business' : 'Pro'}!

Hallo ${firstName},

Vielen Dank für deine Anmeldung bei paymodel.ai ${planName === 'business' ? 'Business' : 'Pro'}! Wir freuen uns sehr, dich dabei zu haben.

Mit deinem neuen ${planName === 'business' ? 'Business' : 'Pro'}-Plan hast du jetzt Zugang zu allen Premium-Features:
- Unbegrenzte Transaktionen
- Erweiterte Analytics
- Team-Funktionen
- Prioritäts-Support
${planName === 'business' ? '- Business-Features' : ''}

Logge dich jetzt ein und starte durch: ${loginUrl}

Falls du Fragen hast oder Hilfe brauchst:
📧 support@paymodel.ai

© 2024 paymodel.ai
  `;

  return { subject, html, text };
}

export type { WelcomeEmailProps };
