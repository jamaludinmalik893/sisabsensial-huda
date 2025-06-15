
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface Nilai {
  id_nilai: string;
  skor: number;
  jenis_nilai: string;
  catatan?: string;
  judul_tugas: string;
  tanggal_tugas_dibuat: string;
  tanggal_nilai: string;
  siswa: {
    id_siswa: string;
    nama_lengkap: string;
    nisn: string;
  };
  mata_pelajaran: {
    nama_mapel: string;
  };
}

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

export const useNilaiData = (userSession: UserSession) => {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkValues, setBulkValues] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadMataPelajaranByGuru(),
        loadKelas(),
        loadNilai()
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

  const loadNilai = async () => {
    try {
      const { data, error } = await supabase
        .from('nilai')
        .select(`
          id_nilai,
          skor,
          jenis_nilai,
          catatan,
          judul_tugas,
          tanggal_tugas_dibuat,
          tanggal_nilai,
          siswa!inner(
            id_siswa,
            nama_lengkap,
            nisn
          ),
          mata_pelajaran!inner(nama_mapel),
          jurnal_harian!inner(id_guru)
        `)
        .eq('jurnal_harian.id_guru', userSession.guru.id_guru)
        .order('tanggal_nilai', { ascending: false });

      if (error) throw error;
      setNilaiList(data || []);
    } catch (error) {
      console.error('Error loading nilai:', error);
    }
  };

  const loadSiswaByKelas = async (kelasId: string) => {
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('id_siswa, nama_lengkap, nisn')
        .eq('id_kelas', kelasId)
        .order('nama_lengkap');

      if (error) throw error;
      setSiswaList(data || []);
      
      // Initialize bulk values
      const initialValues: { [key: string]: string } = {};
      data?.forEach(siswa => {
        initialValues[siswa.id_siswa] = '';
      });
      setBulkValues(initialValues);
    } catch (error) {
      console.error('Error loading siswa:', error);
    }
  };

  const handleBulkValueChange = (siswaId: string, value: string) => {
    setBulkValues(prev => ({
      ...prev,
      [siswaId]: value
    }));
  };

  const handleBulkSubmit = async (
    selectedMapel: string,
    jenisNilai: string,
    judulTugas: string,
    tanggalTugasDibuat: string
  ) => {
    if (selectedMapel === 'all' || !jenisNilai || jenisNilai === 'all' || !judulTugas || !tanggalTugasDibuat) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Create a dummy jurnal entry for bulk insert
      const { data: jurnalData, error: jurnalError } = await supabase
        .from('jurnal_harian')
        .insert({
          id_guru: userSession.guru.id_guru,
          id_mapel: selectedMapel,
          id_kelas: siswaList[0]?.id_siswa ? 
            (await supabase.from('siswa').select('id_kelas').eq('id_siswa', siswaList[0].id_siswa).single()).data?.id_kelas 
            : '',
          tanggal_pelajaran: tanggalTugasDibuat,
          waktu_mulai: '00:00',
          waktu_selesai: '00:00',
          judul_materi: judulTugas,
          materi_diajarkan: `Entry nilai massal - ${judulTugas}`
        })
        .select()
        .single();

      if (jurnalError) throw jurnalError;

      const nilaiToInsert = Object.entries(bulkValues)
        .filter(([_, value]) => value.trim() !== '')
        .map(([siswaId, value]) => ({
          id_siswa: siswaId,
          id_jurnal: jurnalData.id_jurnal,
          id_mapel: selectedMapel,
          skor: parseFloat(value),
          jenis_nilai: jenisNilai,
          judul_tugas: judulTugas,
          tanggal_tugas_dibuat: tanggalTugasDibuat,
          tanggal_nilai: new Date().toISOString().split('T')[0]
        }));

      if (nilaiToInsert.length === 0) {
        toast({
          title: "Error",
          description: "Tidak ada nilai yang dimasukkan",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('nilai')
        .insert(nilaiToInsert);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `${nilaiToInsert.length} nilai berhasil disimpan`
      });

      // Reset bulk values
      setBulkValues({});
      await loadNilai();
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

  const updateNilai = async (nilaiId: string, newSkor: number, newCatatan?: string) => {
    try {
      const { error } = await supabase
        .from('nilai')
        .update({ 
          skor: newSkor,
          catatan: newCatatan,
          updated_at: new Date().toISOString()
        })
        .eq('id_nilai', nilaiId);

      if (error) throw error;

      // Update local state
      setNilaiList(prev => prev.map(nilai => 
        nilai.id_nilai === nilaiId 
          ? { ...nilai, skor: newSkor, catatan: newCatatan }
          : nilai
      ));

      toast({
        title: "Berhasil",
        description: "Nilai berhasil diperbarui"
      });

      return true;
    } catch (error) {
      console.error('Error updating nilai:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui nilai",
        variant: "destructive"
      });
      return false;
    }
  };

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
    loadNilai,
    updateNilai
  };
};
