
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface SiswaAbsensi {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  status_absensi: Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | null>;
}

interface JurnalHari {
  id_jurnal: string;
  mata_pelajaran: string;
  nama_guru: string;
  jam_pelajaran: number;
  judul_materi: string;
}

interface CatatanAbsensi {
  id_absensi: string;
  siswa_nama: string;
  siswa_nisn: string;
  status: string;
  catatan: string;
  guru_nama: string;
  mata_pelajaran: string;
  jam_pelajaran: number;
}

export const useAbsenHarianData = (userSession: UserSession, tanggalPilihan: string) => {
  const [siswaAbsensi, setSiswaAbsensi] = useState<SiswaAbsensi[]>([]);
  const [jurnalHari, setJurnalHari] = useState<JurnalHari[]>([]);
  const [catatanAbsensi, setCatatanAbsensi] = useState<CatatanAbsensi[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadDataAbsensi = useCallback(async () => {
    if (!userSession.kelasWali) return;
    
    setLoading(true);
    try {
      // Load siswa kelas
      const { data: siswaData, error: siswaError } = await supabase
        .from('siswa')
        .select('id_siswa, nama_lengkap, nisn')
        .eq('id_kelas', userSession.kelasWali.id_kelas)
        .order('nama_lengkap');

      if (siswaError) throw siswaError;

      // Load jurnal harian untuk tanggal yang dipilih
      const { data: jurnalData, error: jurnalError } = await supabase
        .from('jurnal_harian')
        .select(`
          id_jurnal,
          jam_pelajaran,
          judul_materi,
          mata_pelajaran!inner(nama_mapel),
          guru!inner(nama_lengkap)
        `)
        .eq('id_kelas', userSession.kelasWali.id_kelas)
        .eq('tanggal_pelajaran', tanggalPilihan)
        .order('jam_pelajaran');

      if (jurnalError) throw jurnalError;

      // Load absensi untuk tanggal yang dipilih
      const jurnalIds = jurnalData?.map(j => j.id_jurnal) || [];
      let absensiData = [];
      
      if (jurnalIds.length > 0) {
        const { data, error: absensiError } = await supabase
          .from('absensi')
          .select('id_siswa, id_jurnal, status, jam_pelajaran')
          .in('id_jurnal', jurnalIds);

        if (absensiError) throw absensiError;
        absensiData = data || [];
      }

      // Load catatan absensi dengan nama guru dan siswa
      let catatanData = [];
      if (jurnalIds.length > 0) {
        const { data: catatanAbsensiData, error: catatanError } = await supabase
          .from('absensi')
          .select(`
            id_absensi,
            status,
            catatan,
            jam_pelajaran,
            siswa!inner(nama_lengkap, nisn),
            jurnal_harian!inner(
              jam_pelajaran,
              mata_pelajaran!inner(nama_mapel),
              guru!inner(nama_lengkap)
            )
          `)
          .in('id_jurnal', jurnalIds)
          .not('catatan', 'is', null)
          .neq('catatan', '');

        if (catatanError) throw catatanError;
        
        catatanData = (catatanAbsensiData || []).map(item => ({
          id_absensi: item.id_absensi,
          siswa_nama: (item.siswa as any)?.nama_lengkap || '',
          siswa_nisn: (item.siswa as any)?.nisn || '',
          status: item.status,
          catatan: item.catatan || '',
          guru_nama: (item.jurnal_harian as any)?.guru?.nama_lengkap || '',
          mata_pelajaran: (item.jurnal_harian as any)?.mata_pelajaran?.nama_mapel || '',
          jam_pelajaran: item.jam_pelajaran || (item.jurnal_harian as any)?.jam_pelajaran || 1
        }));
      }

      // Process data
      const processedSiswa = (siswaData || []).map(siswa => {
        const statusAbsensi: Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | null> = {};
        
        jurnalData?.forEach(jurnal => {
          const absen = absensiData.find(a => a.id_siswa === siswa.id_siswa && a.id_jurnal === jurnal.id_jurnal);
          statusAbsensi[`jp_${jurnal.jam_pelajaran}`] = absen ? absen.status as any : null;
        });

        return {
          ...siswa,
          status_absensi: statusAbsensi
        };
      });

      const processedJurnal = (jurnalData || []).map((jurnal) => ({
        id_jurnal: jurnal.id_jurnal,
        mata_pelajaran: (jurnal.mata_pelajaran as any)?.nama_mapel || '',
        nama_guru: (jurnal.guru as any)?.nama_lengkap || '',
        jam_pelajaran: jurnal.jam_pelajaran || 1,
        judul_materi: jurnal.judul_materi
      }));

      setSiswaAbsensi(processedSiswa);
      setJurnalHari(processedJurnal);
      setCatatanAbsensi(catatanData);
    } catch (error) {
      console.error('Error loading data absensi:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data absensi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [userSession.kelasWali, tanggalPilihan, toast]);

  const countStatus = useCallback((status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => {
    return siswaAbsensi.reduce((count, siswa) => {
      return count + Object.values(siswa.status_absensi).filter(s => s === status).length;
    }, 0);
  }, [siswaAbsensi]);

  return {
    siswaAbsensi,
    jurnalHari,
    catatanAbsensi,
    loading,
    loadDataAbsensi,
    countStatus
  };
};
