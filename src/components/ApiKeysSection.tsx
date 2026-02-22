"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Key, Save, Eye, EyeOff } from "lucide-react";

interface ApiKeysSectionProps {
  user: any;
}

export function ApiKeysSection({ user }: ApiKeysSectionProps) {
  const supabase = createClient();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState({
    openrouter: "",
    openai: "",
    anthropic: "",
    google: "",
  });
  const [showKeys, setShowKeys] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing keys
  useEffect(() => {
    if (user?.user_metadata?.api_keys) {
      setApiKeys({
        openrouter: user.user_metadata.api_keys.openrouter || "",
        openai: user.user_metadata.api_keys.openai || "",
        anthropic: user.user_metadata.api_keys.anthropic || "",
        google: user.user_metadata.api_keys.google || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          api_keys: {
            openrouter: apiKeys.openrouter || null,
            openai: apiKeys.openai || null,
            anthropic: apiKeys.anthropic || null,
            google: apiKeys.google || null,
          }
        }
      });
      
      if (error) throw error;
      toast.success("API-Keys gespeichert");
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          API-Keys
        </CardTitle>
        <CardDescription>
          Verwalten Sie Ihre API-Keys für verschiedene Provider
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="openrouter">OpenRouter API-Key</Label>
            <Input
              id="openrouter"
              type={showKeys ? "text" : "password"}
              placeholder="sk-or-..."
              value={apiKeys.openrouter}
              onChange={(e) => setApiKeys({ ...apiKeys, openrouter: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="openai">OpenAI API-Key</Label>
            <Input
              id="openai"
              type={showKeys ? "text" : "password"}
              placeholder="sk-..."
              value={apiKeys.openai}
              onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="anthropic">Anthropic API-Key</Label>
            <Input
              id="anthropic"
              type={showKeys ? "text" : "password"}
              placeholder="sk-ant-..."
              value={apiKeys.anthropic}
              onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="google">Google AI API-Key</Label>
            <Input
              id="google"
              type={showKeys ? "text" : "password"}
              placeholder="AIza..."
              value={apiKeys.google}
              onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Speichern
          </Button>
          <Button variant="outline" onClick={() => setShowKeys(!showKeys)}>
            {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
