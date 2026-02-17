# Supabase Setup - Manueller Schritt erforderlich

## ✅ Abgeschlossen
- .env.local erstellt mit Supabase Credentials
- Dev Server läuft auf http://localhost:3001

## ⚠️ Noch erforderlich: Schema deployen

Da keine direkte Postgres-Verbindung möglich ist, bitte folgende Schritte im Supabase Dashboard ausführen:

1. Öffne: https://caamywhuejgexlcvupod.supabase.co
2. Gehe zu **SQL Editor**
3. Kopiere den Inhalt von `supabase/schema.sql` und führe aus
4. Kopiere den Inhalt von `supabase/seed.sql` und führe aus

Alternativ per CLI (mit Access Token):
```bash
supabase login
cd paymodel-ai
supabase link --project-ref caamywhuejgexlcvupod
supabase db push
```

## Nach dem Schema-Deploy
Der Dev Server verbindet sich automatisch mit Supabase.
