# Google OAuth Setup Guide

Der Google OAuth Login ist im Code bereits implementiert. Du musst nur noch die folgenden Schritte ausführen, um ihn zu aktivieren.

---

## 1. Google Cloud Console konfigurieren

### Schritt 1.1: Projekt erstellen/auswählen
1. Öffne die [Google Cloud Console](https://console.cloud.google.com)
2. Erstelle ein neues Projekt oder wähle ein bestehendes aus

### Schritt 1.2: OAuth 2.0 Credentials erstellen
1. Gehe zu **APIs & Services** → **Credentials**
2. Klicke auf **"Create Credentials"** → **OAuth client ID**
3. Wähle **Application type**: `Web application`
4. Gib einen Namen ein (z.B. "paymodel.ai")

### Schritt 1.3: Authorized Redirect URIs hinzufügen
Im Abschnitt **Authorized redirect URIs** füge folgende URLs hinzu:

```
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
https://paymodel.ai/api/auth/callback/google
```

*(Falls dein Dev Server auf einem anderen Port läuft, passe die URL entsprechend an)*

### Schritt 1.4: Credentials kopieren
Nach dem Erstellen erhältst du:
- **Client ID** (z.B. `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
- **Client Secret** (z.B. `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`)

**WICHTIG:** Speichere diese Werte sicher!

---

## 2. Supabase konfigurieren

### Schritt 2.1: Provider aktivieren
1. Öffne das [Supabase Dashboard](https://supabase.com/dashboard)
2. Wähle dein Projekt: `caamywhuejgexlcvupod`
3. Gehe zu **Authentication** → **Providers**
4. Klicke auf **Google** (Provider ist bereits in der Liste)

### Schritt 2.2: Google Provider konfigurieren
Aktiviere den Provider mit folgenden Einstellungen:

| Einstellung | Wert |
|-------------|------|
| **Enable Provider** | ✅ An |
| **Client ID** | Deine Google Client ID |
| **Client Secret** | Dein Google Client Secret |
| **Redirect URLs** | `http://localhost:3000/auth/callback/google` |

### Schritt 2.3: Speichern
Klicke auf **Save** um die Konfiguration zu speichern.

---

## 3. Testen

### Lokal testen:
1. Starte den Dev Server: `npm run dev`
2. Öffne http://localhost:3000/login
3. Klicke auf **"Mit Google anmelden"**
4. Du solltest zum Google Login weitergeleitet werden

### Produktion testen:
1. Deploye die App zu Vercel/Produktion
2. Stelle sicher, dass `NEXT_PUBLIC_SUPABASE_URL` korrekt gesetzt ist
3. Teste den Login unter https://paymodel.ai/login

---

## Fehlerbehebung

### "Invalid OAuth Client" Fehler
→ Prüfe ob die Client ID in Supabase korrekt eingetragen ist

### "redirect_uri_mismatch" Fehler
→ Die Redirect URL in Google Cloud Console stimmt nicht überein. Füge die korrekte URL hinzu (s.o.)

### Google Button erscheint nicht
→ Prüfe die Browser Console für JavaScript-Fehler

---

## Bereits implementiert (Code-Seite)

Der folgende Code ist bereits vorhanden:

- ✅ `/src/app/login/page.tsx` - Google OAuth Button integriert
- ✅ `/src/lib/supabase/client.ts` - Supabase Client konfiguriert

Du musst nur noch die Google Cloud Console und Supabase Dashboard Konfiguration abschließen!

---

## Nächste Schritte

Nach erfolgreichem Setup kannst du:
- Benutzerprofile mit Google Daten anreichern
- E-Mail-Verifizierung für Google Nutzer aktivieren
- Account-Linking für bestehende Nutzer einrichten
