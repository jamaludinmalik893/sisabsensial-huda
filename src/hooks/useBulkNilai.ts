
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
      const nilaiToInsert = siswaList.map((siswa) => {
        const value = bulkValues[siswa.id_siswa];
        let skorRaw = (value && value.skor !== undefined) ? value.skor : '';
        let skor = (!skorRaw || isNaN(Number(skorRaw))) ? 0 : parseFloat(skorRaw);
        let catatan = value?.catatan ?? '';
        return {
          id_siswa: siswa.id_siswa,
          id_mapel: selectedMapel,
          skor: skor,
          jenis_nilai: jenisNilai,
          judul_tugas: judulTugas,
          tanggal_tugas_dibuat: tanggalTugasDibuat,
          tanggal_nilai: new Date().toISOString().split('T')[0],
          catatan: catatan,
          // id_jurnal sudah dihapus, tidak dikirim ke supabase
        };
      });

      if (nilaiToInsert.length === 0) {
        toast({
          title: "Error",
          description: "Tidak ada siswa yang diproses",
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
