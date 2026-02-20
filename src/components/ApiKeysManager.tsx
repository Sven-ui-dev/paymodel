"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Copy, Check, Key, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
  expires_at: string | null;
  usage_count: number;
}

interface ApiKeysManagerProps {
  userId: string;
}

export function ApiKeysManager({ userId }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyDays, setNewKeyDays] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, [userId]);

  const fetchKeys = async () => {
    try {
      const response = await fetch("/api/keys", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (!response.ok) throw new Error("Failed to fetch keys");
      const data = await response.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error("Error fetching keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return;
    
    setCreating(true);
    try {
      const response = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          name: newKeyName,
          expires_in_days: newKeyDays ? parseInt(newKeyDays) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create key");
      }

      const data = await response.json();
      setCreatedKey(data.key);
      setNewKeyName("");
      setNewKeyDays("");
      fetchKeys();
    } catch (error) {
      toast.error("Fehler", {
        description: error instanceof Error ? error.message : "Key konnte nicht erstellt werden",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm("Möchtest du diesen API-Key wirklich löschen?")) return;

    try {
      const response = await fetch(`/api/keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (!response.ok) throw new Error("Failed to delete key");
      setKeys(keys.filter((k) => k.id !== keyId));
      toast.success("API-Key gelöscht");
    } catch (error) {
      toast.error("Fehler beim Löschen");
    }
  };

  const copyKey = async (key: string, keyId: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(keyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          API-Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Button */}
        <Button onClick={() => setShowCreateDialog(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Neuen API-Key erstellen
        </Button>

        {/* Keys List */}
        {loading ? (
          <p className="text-muted-foreground text-center py-4">Lade...</p>
        ) : keys.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Noch keine API-Keys erstellt
          </p>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="p-4 border rounded-lg bg-muted/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Erstellt: {formatDate(key.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={key.is_active ? "default" : "secondary"}>
                      {key.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background p-2 rounded font-mono">
                    {key.key}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyKey(key.key, key.id)}
                  >
                    {copiedId === key.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{key.usage_count} Aufrufe</span>
                  {key.last_used_at && (
                    <span>Zuletzt: {formatDate(key.last_used_at)}</span>
                  )}
                  {key.expires_at && (
                    <span>Läuft ab: {formatDate(key.expires_at)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* API Documentation */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">API-Endpunkte</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">GET</Badge>
              <code className="text-xs">/api/v1/models</code>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">POST</Badge>
              <code className="text-xs">/api/v1/compare</code>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">POST</Badge>
              <code className="text-xs">/api/v1/calculate</code>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Header: <code>Authorization: Bearer pk_...</code>
          </p>
        </div>
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen API-Key erstellen</DialogTitle>
          </DialogHeader>
          
          {createdKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">API-Key erstellt!</span>
                </div>
                <p className="text-xs text-green-600 mb-2">
                  Speichere diesen Key sicher. Du kannst ihn später nicht mehr sehen.
                </p>
                <code className="block p-3 bg-white rounded font-mono text-sm break-all">
                  {createdKey}
                </code>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(createdKey);
                  toast.success("In Zwischenablage kopiert");
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                In Zwischenablage kopieren
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCreatedKey(null);
                  setShowCreateDialog(false);
                }}
              >
                Schließen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Name</Label>
                <Input
                  id="keyName"
                  placeholder="z.B. Production API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyDays">Läuft ab nach (Tage, optional)</Label>
                <Input
                  id="keyDays"
                  type="number"
                  placeholder="z.B. 90"
                  value={newKeyDays}
                  onChange={(e) => setNewKeyDays(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">
                  Der Key wird nur einmal angezeigt. Speichere ihn sicher.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Abbrechen
                </Button>
                <Button onClick={createKey} disabled={creating || !newKeyName.trim()}>
                  {creating ? "Erstelle..." : "Erstellen"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
