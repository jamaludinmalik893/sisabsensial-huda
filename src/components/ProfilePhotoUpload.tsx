
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onUploadSuccess: (url: string) => void;
  disabled?: boolean;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhotoUrl,
  onUploadSuccess,
  disabled,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File harus gambar maksimal 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `profile-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;

      const { data } = supabase.storage.from("profile-photos").getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error("Upload gagal.");
      onUploadSuccess(data.publicUrl);

      toast({ title: "Sukses", description: "Foto profil diupdate." });
    } catch (err) {
      toast({
        title: "Gagal upload",
        description: "Silakan coba gambar lain.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {currentPhotoUrl ? (
        <img
          src={currentPhotoUrl}
          alt="Foto profil"
          className="w-14 h-14 rounded-full object-cover border"
        />
      ) : (
        <div className="w-14 h-14 rounded-full flex items-center justify-center border bg-gray-100">
          <Camera className="w-7 h-7 text-gray-400" />
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        disabled={uploading || disabled}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mr-2" />
        {currentPhotoUrl ? "Ganti Foto" : "Unggah Foto"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
export default ProfilePhotoUpload;
