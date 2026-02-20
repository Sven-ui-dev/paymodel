export const metadata = {
  title: "Datenschutz - paymodel.ai",
  description: "Datenschutzerklärung von paymodel.ai",
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">🤖 paymodel.ai</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-3xl font-bold mb-6">Datenschutzerklärung</h2>

        <div className="space-y-6 text-muted-foreground">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">1. Verantwortlicher</h3>
            <p>Sven Grewe</p>
            <p>c/o Impressumservice Dein-Impressum</p>
            <p>Stettiner Straße 41</p>
            <p>35410 Hungen</p>
            <p>E-Mail: info@paymodel.ai</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">2. Erhebung und Speicherung personenbezogener Daten</h3>
            <p>
              Wir erheben und speichern personenbezogene Daten nur, wenn Sie uns diese 
              freiwillig mitteilen, z.B. durch die Registrierung auf unserer Website 
              oder die Anmeldung zum Newsletter.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">3. Zwecke der Datenverarbeitung</h3>
            <p>Wir verarbeiten Ihre Daten zu folgenden Zwecken:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Bereitstellung unserer Dienste</li>
              <li>Kundenkommunikation</li>
              <li>Verbesserung unserer Angebote</li>
              <li>Abwicklung von Zahlungen</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">4. Cookies</h3>
            <p>
              Unsere Website verwendet Cookies. Dies sind kleine Textdateien, die auf 
              Ihrem Endgerät gespeichert werden. Sie dienen zur Bereitstellung 
              grundlegender Funktionen und zur Analyse der Website-Nutzung.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">5. Analyse-Tools</h3>
            <p>
              Wir nutzen Vercel Speed Insights zur Analyse der Website-Performance. 
              Es werden keine personenbezogenen Daten an Dritte weitergegeben.
              Wir erheben ausschließlich die technisch notwendigen Daten für den Betrieb.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">6. Externe Links</h3>
            <p>
              Unsere Website enthält Links zu externen Anbietern (z.B. OpenAI, Anthropic). 
              Für deren Datenschutzpraktiken sind wir nicht verantwortlich.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">7. Ihre Rechte</h3>
            <p>Sie haben jederzeit das Recht auf:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Auskunft über Ihre gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung Ihrer Daten</li>
              <li>Einschränkung der Verarbeitung</li>
              <li>Datenübertragbarkeit</li>
              <li>Widerspruch gegen die Verarbeitung</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">8. Kontakt</h3>
            <p>
              Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden: 
              info@paymodel.ai
            </p>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm">
              Stand: {new Date().toLocaleDateString("de-DE")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
