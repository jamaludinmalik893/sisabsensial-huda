
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { BulkNilaiData, Siswa } from '@/types/nilai';
import { useToast } from '@/hooks/use-toast';

export const useBulkNilai = (userSession: UserSession) => {
  const [bulkValues, setBulkValues] = useState<{ [key: string]: string | { skor: string, catatan: string } }>({});
  const { toast } = useToast();

  const handleBulkValueChange = (siswaId: string, value: string | { skor: number, catatan: string }) => {
    // Support both backward (just skor) and forward (skor+catatan) entry
    setBulkValues(prev => ({
      ...prev,
      [siswaId]: typeof value === 'object'
        ? { skor: String(value.skor), catatan: value.catatan }
        : { skor: String(value), catatan: prev[siswaId]?.catatan ?? '' }
    }));
  };

  const initializeBulkValues = (siswaList: Siswa[]) => {
    const initialValues: { [key: string]: { skor: string, catatan: string } } = {};
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
      // Insert skor & catatan
      const nilaiToInsert = Object.entries(bulkValues)
        .filter(([_, value]) => {
          const val = value as { skor: string, catatan: string };
          return val && String(val.skor).trim() !== '';
        })
        .map(([siswaId, value]) => {
          const val = value as { skor: string, catatan: string };
          return {
            id_siswa: siswaId,
            id_mapel: selectedMapel,
            skor: parseFloat(val.skor),
            jenis_nilai: jenisNilai,
            judul_tugas: judulTugas,
            tanggal_tugas_dibuat: tanggalTugasDibuat,
            tanggal_nilai: new Date().toISOString().split('T')[0],
            catatan: val.catatan,
            id_jurnal: null,
          }
        });

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
