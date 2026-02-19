import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { generatePriceAlertEmailContent } from '@/components/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    console.log('🔔 [Price Alerts Cron] Starte tägliche Preisprüfung...');

    // Alle aktiven, nicht ausgelösten Alerts abrufen
    const { data: alerts, error: alertsError } = await supabase
      .from('price_alerts')
      .select(`
        id,
        user_id,
        model_id,
        target_price,
        current_price,
        models!inner (
          name,
          slug,
          providers!inner (
            name,
            slug
          )
        ),
        users!inner (
          email,
          name
        )
      `)
      .eq('is_active', true)
      .eq('is_triggered', false);

    if (alertsError) {
      console.error('❌ [Price Alerts Cron] Fehler beim Laden der Alerts:', alertsError);
      return new Response('Fehler beim Laden der Alerts', { status: 500 });
    }

    if (!alerts || alerts.length === 0) {
      console.log('✅ [Price Alerts Cron] Keine aktiven Alerts gefunden.');
      return new Response('Keine aktiven Alerts gefunden', { status: 200 });
    }

    console.log(`📊 [Price Alerts Cron] Prüfe ${alerts.length} Alerts...`);

    let triggeredCount = 0;
    let emailErrors = 0;

    for (const alert of alerts) {
      try {
        // Aktuellen Preis aus der prices Tabelle holen
        const { data: latestPrice, error: priceError } = await supabase
          .from('prices')
          .select('input_price_per_million, output_price_per_million')
          .eq('model_id', alert.model_id)
          .order('effective_date', { ascending: false })
          .limit(1)
          .single();

        if (priceError || !latestPrice) {
          console.warn(`⚠️ [Price Alerts Cron] Kein Preis gefunden für Modell ${alert.model_id}`);
          continue;
        }

        // Durchschnittspreis berechnen (Mittelwert aus Input/Output)
        const currentPrice = (latestPrice.input_price_per_million + latestPrice.output_price_per_million) / 2;

        // Prüfen ob Zielpreis erreicht
        if (currentPrice <= alert.target_price) {
          console.log(`🎯 [Price Alerts Cron] Alert ausgelöst für Modell ${alert.models.name}`);

          // Email senden
          const { error: emailError } = await resend.emails.send({
            from: 'paymodel.ai <waitlist@paymodel.ai>',
            to: [alert.users.email],
            subject: `Preis-Alert: ${alert.models.name} ist unter deinem Zielpreis!`,
            html: generatePriceAlertEmailContent({
              modelName: alert.models.name,
              providerName: alert.models.providers.name,
              targetPrice: Number(alert.target_price),
              currentPrice,
              modelSlug: alert.models.slug,
            }).html,
            text: generatePriceAlertEmailContent({
              modelName: alert.models.name,
              providerName: alert.models.providers.name,
              targetPrice: Number(alert.target_price),
              currentPrice,
              modelSlug: alert.models.slug,
            }).text,
          });

          if (emailError) {
            console.error(`❌ [Price Alerts Cron] Email-Fehler für Alert ${alert.id}:`, emailError);
            emailErrors++;
            continue;
          }

          // Alert als ausgelöst markieren
          await supabase
            .from('price_alerts')
            .update({
              is_triggered: true,
              is_active: false,
              triggered_at: new Date().toISOString(),
              current_price: currentPrice,
            })
            .eq('id', alert.id);

          triggeredCount++;
        } else {
          // Nur current_price aktualisieren
          await supabase
            .from('price_alerts')
            .update({
              current_price: currentPrice,
            })
            .eq('id', alert.id);
        }
      } catch (err) {
        console.error(`❌ [Price Alerts Cron] Fehler bei Alert ${alert.id}:`, err);
      }
    }

    console.log(`✅ [Price Alerts Cron] Abgeschlossen. Ausgelöst: ${triggeredCount}, Email-Fehler: ${emailErrors}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalAlerts: alerts.length,
        triggered: triggeredCount,
        emailErrors,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ [Price Alerts Cron] Kritischer Fehler:', error);
    return new Response('Interner Serverfehler', { status: 500 });
  }
}
