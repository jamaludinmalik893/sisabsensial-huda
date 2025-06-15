import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface Nilai {
  id_nilai: string;
  jenis_nilai: string;
  skor: number;
  tanggal_nilai: string;
  catatan?: string;
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
  mata_pelajaran: {
    nama_mapel: string;
  };
}

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  kelas?: {
    nama_kelas: string;
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

interface BulkNilaiEntry {
  id_siswa: string;
  skor: string;
  catatan: string;
}

export const useNilaiData = (userSession: UserSession) => {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkValues, setBulkValues] = useState<Record<string, BulkNilaiEntry>>({});
  
  const { toast } = useToast();

  const loadNilai = async () => {
    try {
      let query = supabase
        .from('nilai')
        .select(`
          id_nilai,
          jenis_nilai,
          skor,
          tanggal_nilai,
          catatan,
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
          mata_pelajaran!inner(nama_mapel)
        `);

      // Filter berdasarkan mata pelajaran yang diampu guru jika bukan admin
      if (!userSession.isAdmin) {
        const { data: guruMapel } = await supabase
          .from('guru_mata_pelajaran')
          .select('id_mapel')
          .eq('id_guru', userSession.guru.id_guru);
        
        if (guruMapel && guruMapel.length > 0) {
          const mapelIds = guruMapel.map(gm => gm.id_mapel);
          query = query.in('id_mapel', mapelIds);
        }
      }

      query = query.order('tanggal_nilai', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setNilaiList(data || []);
    } catch (error) {
      console.error('Error loading nilai:', error);
    }
  };

  const loadMataPelajaranGuru = async () => {
    try {
      let query = supabase.from('mata_pelajaran').select('id_mapel, nama_mapel');

      // Filter berdasarkan mata pelajaran yang diampu guru jika bukan admin
      if (!userSession.isAdmin) {
        const { data: guruMapel } = await supabase
          .from('guru_mata_pelajaran')
          .select('id_mapel')
          .eq('id_guru', userSession.guru.id_guru);
        
        if (guruMapel && guruMapel.length > 0) {
          const mapelIds = guruMapel.map(gm => gm.id_mapel);
          query = query.in('id_mapel', mapelIds);
        }
      }

      query = query.order('nama_mapel');

      const { data, error } = await query;
      if (error) throw error;
      setMapelList(data || []);
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

  const loadSiswaByKelas = async (selectedKelas: string) => {
    if (!selectedKelas) return;

    try {
      const { data, error } = await supabase
        .from('siswa')
        .select(`
          id_siswa, 
          nama_lengkap, 
          nisn,
          kelas(nama_kelas)
        `)
        .eq('id_kelas', selectedKelas)
        .order('nama_lengkap');

      if (error) throw error;
      setSiswaList(data || []);
      
      // Initialize bulk values
      const initialBulkValues: Record<string, BulkNilaiEntry> = {};
      data?.forEach(siswa => {
        initialBulkValues[siswa.id_siswa] = {
          id_siswa: siswa.id_siswa,
          skor: '',
          catatan: ''
        };
      });
      setBulkValues(initialBulkValues);
    } catch (error) {
      console.error('Error loading siswa:', error);
    }
  };

  const handleBulkValueChange = (siswaId: string, field: 'skor' | 'catatan', value: string) => {
    setBulkValues(prev => ({
      ...prev,
      [siswaId]: {
        ...prev[siswaId],
        [field]: value
      }
    }));
  };

  const handleBulkSubmit = async (selectedMapel: string, selectedJenisNilai: string) => {
    if (selectedMapel === 'all' || selectedJenisNilai === 'all' || !selectedMapel || !selectedJenisNilai) {
      toast({
        title: "Error",
        description: "Pilih mata pelajaran dan jenis nilai terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    // Filter siswa yang memiliki nilai
    const validEntries = Object.values(bulkValues).filter(entry => 
      entry.skor && parseFloat(entry.skor) >= 0 && parseFloat(entry.skor) <= 100
    );

    if (validEntries.length === 0) {
      toast({
        title: "Error",
        description: "Masukkan minimal satu nilai yang valid (0-100)",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the first available jurnal (simplified for demo)
      const { data: jurnalData } = await supabase
        .from('jurnal_harian')
        .select('id_jurnal')
        .limit(1)
        .single();

      const nilaiData = validEntries.map(entry => ({
        id_siswa: entry.id_siswa,
        id_mapel: selectedMapel,
        id_jurnal: jurnalData?.id_jurnal || '00000000-0000-0000-0000-000000000000',
        jenis_nilai: selectedJenisNilai,
        skor: parseFloat(entry.skor),
        tanggal_nilai: new Date().toISOString().split('T')[0],
        catatan: entry.catatan || null
      }));

      const { error } = await supabase
        .from('nilai')
        .insert(nilaiData);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `${validEntries.length} nilai berhasil disimpan`
      });

      // Reset form
      const resetBulkValues: Record<string, BulkNilaiEntry> = {};
      siswaList.forEach(siswa => {
        resetBulkValues[siswa.id_siswa] = {
          id_siswa: siswa.id_siswa,
          skor: '',
          catatan: ''
        };
      });
      setBulkValues(resetBulkValues);
      loadNilai();
      return true;
    } catch (error) {
      console.error('Error saving bulk nilai:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan nilai",
        variant: "destructive"
      });
      return false;
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNilai(),
        loadMataPelajaranGuru(),
        loadKelas()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  return {
    nilaiList,
    siswaList,
    mapelList,
    kelasList,
    loading,
    bulkValues,
    loadSiswaByKelas,
    handleBulkValueChange,
    handleBulkSubmit,
    loadNilai
  };
};
