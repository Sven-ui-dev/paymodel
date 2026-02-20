"use client";

import { useState } from "react";
import { CurrentPrice } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreatePriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: CurrentPrice;
  userId: string;
}

export function CreatePriceAlertModal({
  isOpen,
  onClose,
  model,
  userId,
}: CreatePriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentAvgPrice =
    (model.input_price_per_million + model.output_price_per_million) / 2;
  const currency = model.currency || "EUR";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get session token
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("Nicht eingeloggt");
      }

      const response = await fetch("/api/alerts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          model_id: model.model_id,
          target_price: parseFloat(targetPrice),
          current_price: currentAvgPrice,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Fehler beim Erstellen des Alerts");
      }

      setIsSuccess(true);
      toast.success("Preis-Alert erfolgreich erstellt!", {
        description: `Du wirst benachrichtigt, wenn ${model.model_name} unter ${targetPrice} ${currency} fällt.`,
      });

      // Modal nach kurzer Zeit schließen
      setTimeout(() => {
        onClose();
        resetForm();
      }, 2000);
    } catch (error) {
      toast.error("Fehler", {
        description: error instanceof Error ? error.message : "Etwas ist schief gelaufen",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTargetPrice("");
    setIsSuccess(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preis-Alert erstellen
          </DialogTitle>
          <DialogDescription>
            Erhalte eine E-Mail, wenn der Preis für{" "}
            <strong>{model.model_name}</strong> unter deinen Wunschpreis fällt.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              Alert erstellt! ✓
            </h3>
            <p className="text-muted-foreground">
              Du wirst benachrichtigt, sobald der Preis fällt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="model">Modell</Label>
                <Input
                  id="model"
                  value={`${model.model_name} (${model.provider_name})`}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-price">Aktueller Preis (Ø)</Label>
                <Input
                  id="current-price"
                  value={`${currentAvgPrice.toFixed(4)} ${currency}/M Tokens`}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Durchschnitt aus Input- und Output-Preis
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-price">Zielpreis ({currency}/M)</Label>
                <Input
                  id="target-price"
                  type="number"
                  step="0.0001"
                  min="0"
                  max="999"
                  placeholder="z.B. 0.50"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Du wirst benachrichtigt, wenn der Preis auf oder unter diesen Wert fällt.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading || !targetPrice}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    Alert erstellen
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
