export const metadata = {
  title: "Impressum - paymodel.ai",
  description: "Impressum und Kontaktdaten von paymodel.ai",
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">🤖 paymodel.ai</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h2 className="text-3xl font-bold mb-6">Impressum</h2>

        <div className="space-y-6 text-muted-foreground">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Angaben gemäß § 5 TMG</h3>
            <p>paymodel.ai</p>
            <p>E-Mail: info@paymodel.ai</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Haftung für Inhalte</h3>
            <p>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
              können wir jedoch keine Gewähr übernehmen.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Haftung für Links</h3>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren 
              Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten 
              Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Urheberrecht</h3>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen 
              Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, 
              Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
              Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des 
              jeweiligen Autors bzw. Erstellers.
            </p>
          </div>

          <div className="pt-6">
            <p className="text-sm">
              Stand: {new Date().toLocaleDateString("de-DE")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
