import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
}

interface AbsensiStatus {
  [key: string]: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
}

interface AbsensiCatatan {
  [key: string]: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

export const useAbsensiData = (userSession: UserSession) => {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [judulMateri, setJudulMateri] = useState('');
  const [materiDiajarkan, setMateriDiajarkan] = useState('');
  const [waktuMulai, setWaktuMulai] = useState('');
  const [waktuSelesai, setWaktuSelesai] = useState('');
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [absensiData, setAbsensiData] = useState<AbsensiStatus>({});
  const [absensiCatatan, setAbsensiCatatan] = useState<AbsensiCatatan>({});
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(false);
  const [tanggalPelajaran, setTanggalPelajaran] = useState(new Date().toISOString().split('T')[0]);
  
  const today = new Date().toISOString().split('T')[0];
  const { toast } = useToast();

  // Load kelas list
  useEffect(() => {
    loadKelas();
  }, []);

  // Load mata pelajaran based on guru
  useEffect(() => {
    if (userSession.guru?.id_guru) {
      loadMataPelajaranByGuru();
    }
  }, [userSession.guru?.id_guru]);

  // Load siswa when kelas is selected
  useEffect(() => {
    if (selectedKelas) {
      loadSiswaByKelas();
    }
  }, [selectedKelas]);

  const loadKelas = async () => {
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select('id_kelas, nama_kelas')
        .order('nama_kelas');

      if (error) throw error;
      setKelasList(data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kelas",
        variant: "destructive"
      });
    }
  };

  const loadMataPelajaranByGuru = async () => {
    try {
      const { data, error } = await supabase
        .from('guru_mata_pelajaran')
        .select(`
          mata_pelajaran!inner(
            id_mapel,
            nama_mapel
          )
        `)
        .eq('id_guru', userSession.guru.id_guru);

      if (error) throw error;
      
      const mapelData = data?.map(item => item.mata_pelajaran).flat() || [];
      setMapelList(mapelData);
    } catch (error) {
      console.error('Error loading mata pelajaran:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data mata pelajaran",
        variant: "destructive"
      });
    }
  };

  const loadSiswaByKelas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('siswa')
        .select('id_siswa, nama_lengkap, nisn')
        .eq('id_kelas', selectedKelas)
        .order('nama_lengkap');

      if (error) throw error;
      setSiswaList(data || []);
    } catch (error) {
      console.error('Error loading siswa:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAbsensiStatus = useCallback((siswaId: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => {
    setAbsensiData(prev => ({
      ...prev,
      [siswaId]: status
    }));
  }, []);

  const updateAbsensiCatatan = useCallback((siswaId: string, catatan: string) => {
    setAbsensiCatatan(prev => ({
      ...prev,
      [siswaId]: catatan
    }));
  }, []);

  const saveAbsensi = async () => {
    if (!selectedKelas || !selectedMapel || !judulMateri || !waktuMulai) {
      toast({
        title: "Error",
        description: "Harap lengkapi semua data pembelajaran",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Calculate jam_pelajaran range
      const jamMulai = parseInt(waktuMulai);
      const jamSelesai = waktuSelesai ? parseInt(waktuSelesai) : jamMulai;
      
      // Generate jam pelajaran array
      const jamPelajaranArray = [];
      for (let jp = jamMulai; jp <= jamSelesai; jp++) {
        jamPelajaranArray.push(jp);
      }

      // Create jurnal entries for each jam pelajaran
      const jurnalPromises = jamPelajaranArray.map(async (jp) => {
        const { data: jurnalData, error: jurnalError } = await supabase
          .from('jurnal_harian')
          .insert({
            id_guru: userSession.guru.id_guru,
            id_kelas: selectedKelas,
            id_mapel: selectedMapel,
            tanggal_pelajaran: tanggalPelajaran,
            waktu_mulai: `${jp.toString().padStart(2, '0')}:00`,
            waktu_selesai: `${jp.toString().padStart(2, '0')}:45`,
            judul_materi: judulMateri,
            materi_diajarkan: materiDiajarkan,
            jam_pelajaran: jp
          })
          .select()
          .single();

        if (jurnalError) throw jurnalError;
        return { jurnal: jurnalData, jamPelajaran: jp };
      });

      const jurnalResults = await Promise.all(jurnalPromises);

      // Create absensi entries
      const absensiEntries = [];
      
      for (const siswa of siswaList) {
        const status = absensiData[siswa.id_siswa] || 'Hadir';
        const catatan = absensiCatatan[siswa.id_siswa] || '';

        for (const { jurnal, jamPelajaran } of jurnalResults) {
          absensiEntries.push({
            id_jurnal: jurnal.id_jurnal,
            id_siswa: siswa.id_siswa,
            status: status,
            catatan: catatan,
            jam_pelajaran: jamPelajaran
          });
        }
      }

      const { error: absensiError } = await supabase
        .from('absensi')
        .insert(absensiEntries);

      if (absensiError) throw absensiError;

      toast({
        title: "Berhasil",
        description: `Absensi berhasil disimpan untuk JP ${jamMulai}${jamSelesai > jamMulai ? ` - ${jamSelesai}` : ''}`,
      });

      // Reset form
      setJudulMateri('');
      setMateriDiajarkan('');
      setWaktuMulai('');
      setWaktuSelesai('');
      setAbsensiData({});
      setAbsensiCatatan({});
      
    } catch (error) {
      console.error('Error saving absensi:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data absensi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedKelas,
    selectedMapel,
    judulMateri,
    materiDiajarkan,
    waktuMulai,
    waktuSelesai,
    siswaList,
    absensiData,
    absensiCatatan,
    kelasList,
    mapelList,
    loading,
    today,
    tanggalPelajaran,
    setTanggalPelajaran,
    setSelectedKelas,
    setSelectedMapel,
    setJudulMateri,
    setMateriDiajarkan,
    setWaktuMulai,
    setWaktuSelesai,
    updateAbsensiStatus,
    updateAbsensiCatatan,
    saveAbsensi
  };
};
