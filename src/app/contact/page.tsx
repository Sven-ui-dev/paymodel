"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // Simulate sending (MVP - ohne echten SMTP)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">🤖 paymodel.ai</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Nachricht gesendet!</h2>
              <p className="text-muted-foreground text-center">
                Vielen Dank für deine Nachricht. Wir werden uns so schnell wie möglich bei dir melden.
              </p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => {
                  setStatus("idle");
                  setFormData({ name: "", email: "", message: "" });
                }}
              >
                Neue Nachricht senden
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">🤖 paymodel.ai</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Kontakt
            </CardTitle>
            <CardDescription>
              Schreib uns eine Nachricht – wir melden uns schnellstmöglich zurück.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Dein Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="deine@email.de"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Nachricht</Label>
                <Textarea
                  id="message"
                  placeholder="Deine Nachricht..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={status === "sending"}>
                {status === "sending" ? (
                  "Wird gesendet..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Nachricht senden
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Oder schreibe uns direkt an: info@paymodel.ai
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
