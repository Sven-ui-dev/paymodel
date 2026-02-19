"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ArrowLeft, Download, Calendar, DollarSign, CreditCard } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Helper function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = "eur") => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Stripe amounts are in cents
};

interface Invoice {
  id: string;
  created_at: string;
  amount_paid: number;
  currency: string;
  status: string;
  plan_name: string;
  stripe_invoice_url?: string;
  invoice_number?: string;
}

export default function InvoicesPage() {
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);
    await fetchInvoices(user.id);
  };

  const fetchInvoices = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscription_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Rechnungen konnten nicht geladen werden");
        setInvoices([]);
      } else {
        setInvoices(data || []);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      paid: { variant: "default", label: "Bezahlt" },
      open: { variant: "secondary", label: "Offen" },
      void: { variant: "destructive", label: "Storniert" },
      uncollectible: { variant: "destructive", label: "Nicht einziehbar" },
    };
    
    const config = statusConfig[status.toLowerCase()] || { variant: "secondary" as "secondary", label: status };
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">
              paymodel.ai
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Rechnungs-Historie</h1>
            <p className="text-muted-foreground mt-1">
              Alle deine Rechnungen auf einen Blick
            </p>
          </div>
        </div>

        {invoices.length === 0 ? (
          // Empty State
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Keine Rechnungen vorhanden</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Du hast noch keine Rechnungen. Sobald du einen kostenpflichtigen Plan 
                abonnierst, werden deine Rechnungen hier angezeigt.
              </p>
              <Link href="/pricing">
                <Button>Jetzt Plan auswählen</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          // Invoices Table
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Alle Rechnungen
              </CardTitle>
              <CardDescription>
                {invoices.length} {invoices.length === 1 ? "Rechnung" : "Rechnungen"} gefunden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium pr-4">Rechnungsnummer</th>
                      <th className="pb-3 font-medium pr-4">Datum</th>
                      <th className="pb-3 font-medium pr-4">Plan</th>
                      <th className="pb-3 font-medium pr-4">Betrag</th>
                      <th className="pb-3 font-medium pr-4">Status</th>
                      <th className="pb-3 font-medium text-right">Aktion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b last:border-0">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {invoice.invoice_number || `INV-${invoice.id.slice(-8).toUpperCase()}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(invoice.created_at)}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant="outline">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {invoice.plan_name || "Standard Plan"}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatCurrency(invoice.amount_paid, invoice.currency)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="py-4 text-right">
                          {invoice.stripe_invoice_url && (
                            <a
                              href={invoice.stripe_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                              </Button>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
