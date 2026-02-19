"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Loader2,
  LogOut,
  User,
  Mail,
  Lock,
  Trash2,
  Shield,
  Calendar,
  ChevronLeft,
  Camera,
  AlertTriangle,
  Save,
  Key,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
}

interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
}

// Helper function to format date
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setEmail(user.email || "");
    setFullName(user.user_metadata?.full_name || "");

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setProfile(profile);
    }
    setLoading(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");

    if (fullName.trim().length < 2) {
      setNameError("Name muss mindestens 2 Zeichen lang sein");
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Bitte geben Sie eine gültige E-Mail-Adresse ein");
      isValid = false;
    }

    return isValid;
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Update Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        email: email,
        data: {
          full_name: fullName,
        },
      });

      if (authError) {
        if (authError.message.includes("email")) {
          setEmailError("Diese E-Mail-Adresse ist bereits registriert");
          toast.error("E-Mail-Adresse konnte nicht geändert werden");
        } else {
          throw authError;
        }
        setSaving(false);
        return;
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: email,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      toast.success("Profil erfolgreich aktualisiert");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error("Profil konnte nicht aktualisiert werden: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Das neue Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Die Passwörter stimmen nicht überein");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Passwort erfolgreich geändert");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error("Passwort konnte nicht geändert werden: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "LÖSCHEN") {
      setPasswordError("Bitte geben Sie LÖSCHEN ein um fortzufahren");
      return;
    }

    setDeleting(true);
    try {
      // Get the auth header for the API call
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.access_token || "",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Account konnte nicht gelöscht werden");
      }

      toast.success("Ihr Account wurde erfolgreich gelöscht");
      
      // Redirect to home after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast.error(error.message || "Account konnte nicht gelöscht werden");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Einstellungen werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">paymodel.ai</span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Zurück zum Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Account-Einstellungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihr Profil, Sicherheit und Account-Daten
          </p>
        </div>

        {/* Profile Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profil
            </CardTitle>
            <CardDescription>
              Ihre persönlichen Daten und öffentliches Profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 ring-4 ring-primary/10">
                <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                  {fullName ? getInitials(fullName) : email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" disabled>
                  <Camera className="w-4 h-4 mr-2" />
                  Foto ändern
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG oder GIF. Max 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Profile Form */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Vollständiger Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Ihr Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {nameError && (
                  <p className="text-sm text-destructive">{nameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ihre@email.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Änderungen speichern
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Sicherheit
            </CardTitle>
            <CardDescription>
              Verwalten Sie Ihr Passwort und Sicherheitseinstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password Change */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Passwort ändern
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="newPassword">Neues Passwort</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Mindestens 8 Zeichen"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Passwort wiederholen"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={saving || !newPassword || !confirmPassword}
                  variant="outline"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Wird geändert...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Passwort ändern
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Separator />

            {/* 2FA Section (Placeholder) */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Fingerprint className="w-4 h-4" />
                Zwei-Faktor-Authentifizierung
              </h3>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">2FA aktivieren</p>
                  <p className="text-sm text-muted-foreground">
                    Fügen Sie eine zusätzliche Sicherheitsebene hinzu
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Demnächst verfügbar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Konto-Informationen
            </CardTitle>
            <CardDescription>
              Details zu Ihrem Account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Account erstellt</p>
                <p className="font-medium">{formatDate(profile?.created_at || user?.created_at)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Letzte Anmeldung</p>
                <p className="font-medium">{formatDate(user?.last_sign_in_at)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">User ID</p>
                <p className="font-mono text-xs truncate">{user?.id}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">E-Mail bestätigt</p>
                <p className="font-medium">{user?.email_confirmed_at ? "Ja" : "Nein"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Gefahrenzone
            </CardTitle>
            <CardDescription>
              Diese Aktionen sind unwiderruflich. Bitte seien Sie vorsichtig.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <div>
                  <p className="font-medium">Account löschen</p>
                  <p className="text-sm text-muted-foreground">
                    Löschen Sie Ihren Account und alle zugehörigen Daten dauerhaft
                  </p>
                </div>
                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Account löschen
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="LÖSCHEN eingeben"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        className="w-40"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirm("");
                        }}
                      >
                        Abbrechen
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                      disabled={deleting || deleteConfirm !== "LÖSCHEN"}
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Wird gelöscht...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Löschen bestätigen
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 paymodel.ai – Alle Rechte vorbehalten.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/impressum" className="hover:text-foreground transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-foreground transition-colors">
              Datenschutz
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Kontakt
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
