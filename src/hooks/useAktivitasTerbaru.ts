
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserSession } from "@/types";

// Gabungkan riwayat absensi, jurnal, dan nilai terbaru
export interface Aktivitas {
  id: string;
  tipe: "absensi" | "jurnal" | "nilai";
  uraian: string;
  waktu: string; // ISO string
  deskripsi?: string;
  guru: string;
}

export function useAktivitasTerbaru(userSession: UserSession) {
  const [data, setData] = useState<Aktivitas[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAktivitas() {
      setLoading(true);
      try {
        // 1. Data Absensi Terbaru
        const { data: absensis } = await supabase
          .from("absensi")
          .select(`id_absensi, created_at, id_jurnal, siswa(nama_lengkap), jurnal_harian(judul_materi, kelas(nama_kelas), id_guru)`)
          .order("created_at", { ascending: false })
          .limit(5);

        // 2. Data Jurnal Harian Terbaru
        const { data: jurnals } = await supabase
          .from("jurnal_harian")
          .select("id_jurnal, judul_materi, tanggal_pelajaran, created_at, kelas(nama_kelas), guru(nama_lengkap)")
          .order("created_at", { ascending: false })
          .limit(5);

        // 3. Data Nilai Terbaru
        const { data: nilais } = await supabase
          .from("nilai")
          .select("id_nilai, tanggal_nilai, skor, siswa(nama_lengkap), mata_pelajaran(nama_mapel), created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        // Gabungkan dan urutkan berdasarkan waktu (created_at/tanggal_nilai/tanggal_pelajaran)
        const all: Aktivitas[] = [];

        absensis?.forEach((a) => {
          all.push({
            id: "absensi:" + a.id_absensi,
            tipe: "absensi",
            uraian: `Absensi siswa ${a.siswa?.nama_lengkap || ""}`,
            waktu: a.created_at,
            deskripsi: `Kelas: ${a.jurnal_harian?.kelas?.nama_kelas || "-"}, Materi: ${a.jurnal_harian?.judul_materi || "-"}`,
            guru: userSession.guru.nama_lengkap, // atau bisa dari jurnal_harian.guru jika ingin lebih detail
          });
        });

        jurnals?.forEach((j) => {
          all.push({
            id: "jurnal:" + j.id_jurnal,
            tipe: "jurnal",
            uraian: `Jurnal harian: ${j.judul_materi}`,
            waktu: j.created_at || j.tanggal_pelajaran,
            deskripsi: `Kelas: ${j.kelas?.nama_kelas || "-"}`,
            guru: j.guru?.nama_lengkap || userSession.guru.nama_lengkap,
          });
        });

        nilais?.forEach((n) => {
          all.push({
            id: "nilai:" + n.id_nilai,
            tipe: "nilai",
            uraian: `Nilai ${n.mata_pelajaran?.nama_mapel || ""} untuk ${n.siswa?.nama_lengkap || ""}: ${n.skor}`,
            waktu: n.created_at || n.tanggal_nilai,
            deskripsi: undefined,
            guru: userSession.guru.nama_lengkap,
          });
        });

        // Urutkan berdasarkan waktu terbaru
        all.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());

        setData(all.slice(0, 8));
      } catch (e) {
        setData([]);
        console.error("Gagal memuat aktivitas terbaru", e);
      }
      setLoading(false);
    }
    fetchAktivitas();
  }, [userSession]);

  return { data, loading };
}
