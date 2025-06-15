
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { BulkNilaiData, Siswa } from '@/types/nilai';
import { useToast } from '@/hooks/use-toast';

export const useBulkNilai = (userSession: UserSession) => {
  const [bulkValues, setBulkValues] = useState<{ [key: string]: { skor: string; catatan: string } }>({});
  const { toast } = useToast();

  const handleBulkValueChange = (siswaId: string, value: { skor: string; catatan: string } | string) => {
    if (typeof value === 'object' && value !== null) {
      setBulkValues(prev => ({
        ...prev,
        [siswaId]: {
          skor: value.skor?.toString() ?? '',
          catatan: value.catatan ?? ''
        }
      }));
    } else {
      setBulkValues(prev => ({
        ...prev,
        [siswaId]: {
          skor: String(value),
          catatan: prev[siswaId]?.catatan ?? ''
        }
      }));
    }
  };

  const initializeBulkValues = (siswaList: Siswa[]) => {
    const initialValues: { [key: string]: { skor: string; catatan: string } } = {};
    siswaList.forEach(siswa => {
      initialValues[siswa.id_siswa] = { skor: '', catatan: '' };
    });
    setBulkValues(initialValues);
  };

  const handleBulkSubmit = async (
    selectedMapel: string,
    jenisNilai: string,
    judulTugas: string,
    tanggalTugasDibuat: string,
    siswaList: Siswa[]
  ): Promise<boolean> => {
    if (
      selectedMapel === 'all' ||
      !jenisNilai ||
      jenisNilai === 'all' ||
      !judulTugas ||
      !tanggalTugasDibuat
    ) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive"
      });
      return false;
    }

    try {
      // filter & mapping skor & catatan valid
      const nilaiToInsert = Object.entries(bulkValues)
        .filter(([_, value]) => String(value.skor).trim() !== '')
        .map(([siswaId, value]) => ({
          id_siswa: siswaId,
          id_mapel: selectedMapel,
          skor: parseFloat(value.skor),
          jenis_nilai: jenisNilai,
          judul_tugas: judulTugas,
          tanggal_tugas_dibuat: tanggalTugasDibuat,
          tanggal_nilai: new Date().toISOString().split('T')[0],
          catatan: value.catatan,
          id_jurnal: null,
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

      setBulkValues({});
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

  return {
    bulkValues,
    handleBulkValueChange,
    handleBulkSubmit,
    initializeBulkValues
  };
};

// ... end of file ...
