
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { processNilaiData } from './utils/nilaiDataProcessor';
import type { StatistikNilai, LaporanFilters } from '@/types/laporan';

export const useLaporanNilai = (
  guruId: string,
  filters: LaporanFilters
) => {
  const [statistikNilai, setStatistikNilai] = useState<StatistikNilai[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaporanNilai = async () => {
      if (!guruId) return;

      try {
        setLoading(true);
        setError(null);

        // Get mata pelajaran that the teacher teaches
        const { data: mapelData } = await supabase
          .from('guru_mata_pelajaran')
          .select('id_mapel')
          .eq('id_guru', guruId);

        if (mapelData && mapelData.length > 0) {
          const mapelIds = mapelData.map(item => item.id_mapel);
          
          // Get nilai data
          let nilaiQuery = supabase
            .from('nilai')
            .select(`
              *,
              siswa!inner(
                nama_lengkap,
                nisn,
                kelas(nama_kelas)
              ),
              mata_pelajaran!inner(nama_mapel)
            `)
            .in('id_mapel', mapelIds);

          if (filters.tanggalMulai) {
            nilaiQuery = nilaiQuery.gte('tanggal_nilai', filters.tanggalMulai);
          }
          if (filters.tanggalAkhir) {
            nilaiQuery = nilaiQuery.lte('tanggal_nilai', filters.tanggalAkhir);
          }
          // Convert "semua" to null for proper UUID handling
          if (filters.mapel !== 'all' && filters.mapel !== 'semua') {
            nilaiQuery = nilaiQuery.eq('id_mapel', filters.mapel);
          }

          const { data: nilaiData, error: nilaiError } = await nilaiQuery;

          if (nilaiError) {
            console.error('Error fetching nilai data:', nilaiError);
            setError(nilaiError.message);
            return;
          }

          // Process and group data by student
          const processedData = processNilaiData(nilaiData || []);
          setStatistikNilai(processedData);
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan tidak terduga');
      } finally {
        setLoading(false);
      }
    };

    fetchLaporanNilai();
  }, [guruId, filters.tanggalMulai, filters.tanggalAkhir, filters.kelas, filters.mapel]);

  return {
    statistikNilai,
    loading,
    error
  };
};
