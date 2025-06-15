import { useState, useEffect } from 'react';
import { UserSession } from '@/types';
import type { Nilai, MataPelajaran, Kelas } from '@/types/nilai';
import type { Siswa as SiswaIndex } from '@/types/index';
import { useToast } from '@/hooks/use-toast';
import { useNilaiQueries } from './useNilaiQueries';
import { useBulkNilai } from './useBulkNilai';
import { convertSiswaToFullSiswa } from "@/components/nilai/convertSiswaToFullSiswa";

export const useNilaiData = (userSession: UserSession) => {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  // Always ensure siswaList is of the expected (full) type
  const [siswaList, setSiswaList] = useState<SiswaIndex[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const queries = useNilaiQueries(userSession);
  const bulkNilai = useBulkNilai(userSession);

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  const loadInitialData = async () => {
    try {
      const [mapelData, kelasData, nilaiData] = await Promise.all([
        queries.loadMataPelajaranByGuru(),
        queries.loadKelas(),
        queries.loadNilai()
      ]);
      
      setMapelList(mapelData);
      setKelasList(kelasData);
      setNilaiList(nilaiData);
      // Don't touch siswaList here, it is always set via loadSiswaByKelas
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSiswaByKelas = async (kelasId: string) => {
    try {
      const siswaDataRaw = await queries.loadSiswaByKelas(kelasId);

      // Tambahkan log hasil mentah
      console.log("[DEBUG useNilaiData.ts] siswaDataRaw dari Supabase:", siswaDataRaw);

      // Always convert siswa to full type
      const siswaData: SiswaIndex[] = siswaDataRaw.map(siswa => convertSiswaToFullSiswa(siswa));
      setSiswaList(siswaData);
      bulkNilai.initializeBulkValues(siswaData);
    } catch (error) {
      console.error('Error loading siswa:', error);
      setSiswaList([]); // fallback to safe empty state
    }
  };

  const loadNilai = async () => {
    try {
      const nilaiData = await queries.loadNilai();
      setNilaiList(nilaiData);
    } catch (error) {
      console.error('Error loading nilai:', error);
    }
  };

  const updateNilai = async (nilaiId: string, newSkor: number, newCatatan?: string) => {
    try {
      await queries.updateNilai(nilaiId, newSkor, newCatatan);

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

  const deleteNilai = async (nilaiId: string) => {
    try {
      await queries.deleteNilai(nilaiId);
      setNilaiList(prev => prev.filter(nilai => nilai.id_nilai !== nilaiId));
      toast({
        title: "Berhasil",
        description: "Nilai berhasil dihapus"
      });
      return true;
    } catch (error) {
      console.error('Error deleting nilai:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus nilai",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleBulkSubmit = async (
    selectedMapel: string,
    jenisNilai: string,
    judulTugas: string,
    tanggalTugasDibuat: string
  ) => {
    const success = await bulkNilai.handleBulkSubmit(
      selectedMapel,
      jenisNilai,
      judulTugas,
      tanggalTugasDibuat,
      siswaList
    );
    
    if (success) {
      await loadNilai();
    }
    
    return success;
  };

  return {
    nilaiList,
    siswaList,
    mapelList,
    kelasList,
    loading,
    bulkValues: bulkNilai.bulkValues,
    loadSiswaByKelas,
    handleBulkValueChange: bulkNilai.handleBulkValueChange,
    handleBulkSubmit,
    loadNilai,
    updateNilai,
    deleteNilai
  };
};
