import React, { useEffect, useState } from "react";
import { UserSession, Guru, Siswa } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProfilePhotoUpload from "./ProfilePhotoUpload";

// Untuk mendapatkan session, bisa juga diganti dari props/context
function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem("userSession");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const ProfilePage: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(getSession());
  const [profile, setProfile] = useState<Partial<Guru & Siswa>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (session) {
      fetchUser();
    }
    // eslint-disable-next-line
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      if (session?.isGuru) {
        // Guru
        const { data, error } = await supabase
          .from("guru")
          .select("*")
          .eq("id_guru", session.guru.id_guru)
          .single();
        if (error) throw error;
        setProfile(data || {});
      } else if (session?.guru && session.guru.id_guru) {
        // Siswa
        const { data, error } = await supabase
          .from("siswa")
          .select("*")
          .eq("id_siswa", session.guru.id_guru)
          .single();

        if (error) throw error;

        if (data) {
          // Coerce jenis_kelamin to the allowed type only
          const allowedJenisKelamin = ["Laki-laki", "Perempuan"];
          const safeJenisKelamin = allowedJenisKelamin.includes(data.jenis_kelamin)
            ? (data.jenis_kelamin as "Laki-laki" | "Perempuan")
            : undefined;
          setProfile({
            ...data,
            jenis_kelamin: safeJenisKelamin,
          });
        } else {
          setProfile({});
        }
      }
    } catch (err) {
      toast({ title: "Gagal", description: "Tidak dapat mengambil data profil.", variant: "destructive" });
      setProfile({});
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (session?.isGuru) {
        // Guru update
        const { error } = await supabase
          .from("guru")
          .update({
            nama_lengkap: profile.nama_lengkap,
            alamat: profile.alamat,
            nomor_telepon: profile.nomor_telepon,
            foto_url: profile.foto_url,
            email: newEmail || profile.email,
            // password is NOT included here!
          })
          .eq("id_guru", session.guru.id_guru);
        if (error) throw error;
      } else if (session?.guru && session.guru.id_guru) {
        // Siswa update: nomor_telepon_siswa sebagai fallback
        const nomor_telepon_siswa =
          "nomor_telepon_siswa" in profile
            ? (profile as any).nomor_telepon_siswa
            : undefined;

        const { error } = await supabase
          .from("siswa")
          .update({
            nama_lengkap: profile.nama_lengkap,
            alamat: profile.alamat,
            nomor_telepon: profile.nomor_telepon,
            ...(typeof nomor_telepon_siswa !== "undefined"
              ? { nomor_telepon_siswa: nomor_telepon_siswa ?? profile.nomor_telepon ?? "" }
              : {}),
            foto_url: profile.foto_url,
            email: newEmail || profile.email,
            // password is NOT included here!
          })
          .eq("id_siswa", session.guru.id_guru); // id_siswa dari session
        if (error) throw error;
      }
      // Ganti password jika ada input (done as a SEPARATE query)
      if (newPassword && newPassword.length >= 6) {
        if (session?.isGuru) {
          await supabase
            .from("guru")
            .update({ password: newPassword })
            .eq("id_guru", session.guru.id_guru);
        } else if (session?.guru && session.guru.id_guru) {
          await supabase
            .from("siswa")
            .update({ password: newPassword })
            .eq("id_siswa", session.guru.id_guru);
        }
      }

      toast({ title: "Disimpan", description: "Profil berhasil diperbarui." });
    } catch {
      toast({ title: "Gagal", description: "Gagal menyimpan profil.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat profil...</div>;

  return (
    <div className="max-w-xl w-full mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Foto */}
            <ProfilePhotoUpload
              currentPhotoUrl={profile.foto_url}
              onUploadSuccess={(url) => setProfile((p) => ({ ...p, foto_url: url }))}
              disabled={saving}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input
                value={profile.nama_lengkap ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, nama_lengkap: e.target.value }))
                }
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alamat</label>
              <Input
                value={profile.alamat ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, alamat: e.target.value }))
                }
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Telepon</label>
              <Input
                value={profile.nomor_telepon ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setProfile((prev) => ({
                    ...prev,
                    nomor_telepon: v,
                    ...(session?.isGuru
                      ? {}
                      : { nomor_telepon_siswa: v }),
                  }));
                }}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={newEmail || profile.email || ""}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={saving}
                type="email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password Baru</label>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="(Minimal 6 karakter atau kosongkan jika tidak mengubah)"
                disabled={saving}
              />
            </div>
            <Button className="w-full mt-3" onClick={handleSave} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
