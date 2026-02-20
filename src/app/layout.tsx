import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "paymodel.ai - AI Model Preisvergleich",
  description:
    "Vergleiche Token-Preise, Context-Windows und Capabilities von allen großen AI-Providern. Finde das beste Preis-Leistungs-Verhältnis für deinen Use-Case.",
  keywords: [
    "AI Modelle",
    "Preisvergleich",
    "GPT-4",
    "Claude",
    "Gemini",
    "Token Preise",
    "LLM",
    "Kosten",
 ],
  openGraph: {
    title: "paymodel.ai - AI Model Preisvergleich",
    description:
      "Vergleiche Token-Preise, Context-Windows und Capabilities von allen großen AI-Providern.",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  other: {
    "icon": "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="top-center" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
