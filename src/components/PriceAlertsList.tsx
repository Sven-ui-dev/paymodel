"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Trash2, Loader2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PriceAlert {
  alert_id: string;
  user_id: string;
  model_id: string;
  target_price: number;
  current_price: number | null;
  is_active: boolean;
  is_triggered: boolean;
  created_at: string;
  triggered_at: string | null;
  model_name: string;
  model_slug: string;
  provider_name: string;
  provider_slug: string;
}

interface PriceAlertsListProps {
  userId: string;
}

export function PriceAlertsList({ userId }: PriceAlertsListProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, [userId]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/alerts/list?user_id=${userId}`);
      if (!response.ok) throw new Error("Fehler beim Laden der Alerts");
      const data = await response.json();
      setAlerts(data.data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast.error("Fehler beim Laden der Alerts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    setIsDeleting(alertId);
    try {
      const response = await fetch(`/api/alerts/delete/${alertId}?user_id=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Fehler beim Löschen des Alerts");

      setAlerts((prev) => prev.filter((alert) => alert.alert_id !== alertId));
      toast.success("Alert gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen des Alerts");
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Lade Preis-Alerts...</p>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Noch keine Preis-Alerts</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Erstelle einen Preis-Alert, um benachrichtigt zu werden, wenn ein Modell
            unter deinen Wunschpreis fällt.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Meine Preis-Alerts ({alerts.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modell</TableHead>
              <TableHead>Zielpreis</TableHead>
              <TableHead>Aktueller Preis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead className="w-[100px]">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.alert_id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{alert.model_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.provider_name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {Number(alert.target_price).toFixed(4)} €/M
                  </span>
                </TableCell>
                <TableCell>
                  {alert.current_price ? (
                    <span>{Number(alert.current_price).toFixed(4)} €/M</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {alert.is_triggered ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ausgelöst
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Aktiv
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(alert.created_at).toLocaleDateString("de-DE")}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteAlert(alert.alert_id)}
                    disabled={isDeleting === alert.alert_id}
                    title="Alert löschen"
                  >
                    {isDeleting === alert.alert_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
