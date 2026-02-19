import Link from "next/link";

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
            <p className="font-semibold text-foreground">Sven Grewe</p>
            <p>── ADRESSE EINGEBEN ──</p>
            <p className="text-red-500 text-sm mt-1">
              * Bitte hier Ihre ladungsfähige Anschrift eintragen
            </p>
            <p className="mt-4">E-Mail: info@paymodel.ai</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Verbraucherstreitbeilegung</h3>
            <p>
              Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren 
              vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Haftung für Inhalte</h3>
            <p>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
              Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
              können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir 
              gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den 
              allgemeinen Gesetzen verantwortlich.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Haftung für Links</h3>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren 
              Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten 
              Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              Wir distanzieren uns hiermit ausdrücklich von allen Inhalten Dritter.
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

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Datenschutz</h3>
            <p>
              Informationen zum Umgang mit Ihren Daten finden Sie in unserer{" "}
              <Link href="/datenschutz" className="text-primary hover:underline">
                Datenschutzerklärung
              </Link>
              .
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
