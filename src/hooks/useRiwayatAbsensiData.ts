
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';

interface RiwayatAbsensi {
  id_absensi: string;
  status: string;
  catatan?: string;
  created_at: string;
  siswa: {
    id_siswa: string;
    nama_lengkap: string;
    nisn: string;
    jenis_kelamin: string;
    tanggal_lahir: string;
    tempat_lahir: string;
    alamat: string;
    nomor_telepon?: string;
    nama_orang_tua: string;
    nomor_telepon_orang_tua?: string;
    tahun_masuk: number;
    foto_url?: string;
    kelas?: {
      nama_kelas: string;
    };
    guru_wali?: {
      nama_lengkap: string;
    };
  };
  jurnal_harian: {
    id_jurnal: string;
    tanggal_pelajaran: string;
    judul_materi: string;
    mata_pelajaran: {
      nama_mapel: string;
    };
    kelas: {
      nama_kelas: string;
    };
  };
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

export const useRiwayatAbsensiData = (userSession: UserSession) => {
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [riwayatAbsensi, setRiwayatAbsensi] = useState<RiwayatAbsensi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadMataPelajaranByGuru(),
        loadKelas(),
        loadRiwayatAbsensi()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
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
    }
  };

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
    }
  };

  const loadRiwayatAbsensi = async () => {
    try {
      const { data, error } = await supabase
        .from('absensi')
        .select(`
          id_absensi,
          status,
          catatan,
          created_at,
          siswa!inner(
            id_siswa,
            nama_lengkap,
            nisn,
            jenis_kelamin,
            tanggal_lahir,
            tempat_lahir,
            alamat,
            nomor_telepon,
            nama_orang_tua,
            nomor_telepon_orang_tua,
            tahun_masuk,
            foto_url,
            kelas(nama_kelas),
            guru_wali:guru(nama_lengkap)
          ),
          jurnal_harian!inner(
            id_jurnal,
            tanggal_pelajaran,
            judul_materi,
            mata_pelajaran!inner(nama_mapel),
            kelas!inner(nama_kelas),
            id_guru
          )
        `)
        .eq('jurnal_harian.id_guru', userSession.guru.id_guru)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRiwayatAbsensi(data || []);
    } catch (error) {
      console.error('Error loading riwayat absensi:', error);
    }
  };

  return {
    selectedMapel,
    selectedKelas,
    mapelList,
    kelasList,
    riwayatAbsensi,
    loading,
    setSelectedMapel,
    setSelectedKelas
  };
};
