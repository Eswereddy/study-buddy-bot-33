import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Save, User } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePanel() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setDisplayName(data.display_name || "");
      setAvatarUrl(data.avatar_url);
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Append timestamp to bust cache
      const freshUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: freshUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(freshUrl);
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h2 className="font-heading text-xl font-semibold mb-1">Your Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-background" />
            ) : (
              <Camera className="h-5 w-5 text-background" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <div>
          <p className="font-medium">{displayName || "No name set"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-primary hover:underline mt-1"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Change photo"}
          </button>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="pl-10"
          />
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user?.email || ""} disabled className="bg-muted/50" />
        <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Changes
      </Button>
    </div>
  );
}
