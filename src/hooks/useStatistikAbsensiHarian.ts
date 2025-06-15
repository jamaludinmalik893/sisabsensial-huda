
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type StatistikHari = {
  tanggal: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
};

export function useStatistikAbsensiHarian() {
  const [data, setData] = useState<StatistikHari[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAbsensi() {
      setLoading(true);
      try {
        const now = new Date();
        const hari = [];
        for (let i = 6; i >= 0; i--) {
          const tanggal = new Date(now);
          tanggal.setDate(now.getDate() - i);
          hari.push(tanggal.toISOString().slice(0, 10));
        }

        const result: StatistikHari[] = [];
        for (const tgl of hari) {
          // Ambil jurnal hari itu
          const { data: jurnal } = await supabase
            .from("jurnal_harian")
            .select("id_jurnal")
            .eq("tanggal_pelajaran", tgl);

          let hadir = 0, izin = 0, sakit = 0, alpha = 0;
          if (jurnal && jurnal.length > 0) {
            const jurnalIds = jurnal.map(j => j.id_jurnal);
            const { data: absensiRows } = await supabase
              .from("absensi")
              .select("status")
              .in("id_jurnal", jurnalIds);
            absensiRows?.forEach(r => {
              if (r.status === "Hadir") hadir++;
              else if (r.status === "Izin") izin++;
              else if (r.status === "Sakit") sakit++;
              else if (r.status === "Alpha") alpha++;
            });
          }
          result.push({
            tanggal: tgl,
            hadir,
            izin,
            sakit,
            alpha
          });
        }
        setData(result);
      } catch (e) {
        console.error("Gagal memuat statistik absensi harian", e);
        setData([]);
      }
      setLoading(false);
    }
    fetchAbsensi();
  }, []);

  return { data, loading };
}
