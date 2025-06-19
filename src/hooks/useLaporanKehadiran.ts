
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { 
  StatistikKehadiran, 
  StatistikKelas, 
  TrendKehadiran, 
  StatistikOverview,
  LaporanFilters 
} from '@/types/laporan';

export const useLaporanKehadiran = (
  guruId: string,
  filters: LaporanFilters
) => {
  const [statistikKehadiran, setStatistikKehadiran] = useState<StatistikKehadiran[]>([]);
  const [statistikKelas, setStatistikKelas] = useState<StatistikKelas[]>([]);
  const [trendKehadiran, setTrendKehadiran] = useState<TrendKehadiran[]>([]);
  const [overview, setOverview] = useState<StatistikOverview>({
    total_siswa: 0,
    rata_rata_kehadiran: 0,
    kehadiran_tertinggi: 0,
    siswa_alpha_tinggi: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaporanKehadiran = async () => {
      if (!guruId) return;

      try {
        setLoading(true);
        setError(null);

        // Get attendance statistics
        const { data: attendanceData, error: attendanceError } = await supabase.rpc(
          'get_attendance_statistics',
          {
            p_guru_id: guruId,
            p_start_date: filters.tanggalMulai || null,
            p_end_date: filters.tanggalAkhir || null,
            p_kelas_id: filters.kelas !== 'all' ? filters.kelas : null,
            p_mapel_id: filters.mapel !== 'all' ? filters.mapel : null
          }
        );

        if (attendanceError) {
          console.error('Error fetching attendance statistics:', attendanceError);
          setError(attendanceError.message);
          return;
        }

        // Get class attendance statistics
        const { data: classData, error: classError } = await supabase.rpc(
          'get_class_attendance_stats',
          {
            p_guru_id: guruId,
            p_start_date: filters.tanggalMulai || null,
            p_end_date: filters.tanggalAkhir || null,
            p_kelas_id: filters.kelas !== 'all' ? filters.kelas : null,
            p_mapel_id: filters.mapel !== 'all' ? filters.mapel : null
          }
        );

        if (classError) {
          console.error('Error fetching class statistics:', classError);
          setError(classError.message);
          return;
        }

        // Get attendance trend
        const { data: trendData, error: trendError } = await supabase.rpc(
          'get_attendance_trend',
          {
            p_guru_id: guruId,
            p_start_date: filters.tanggalMulai || null,
            p_end_date: filters.tanggalAkhir || null,
            p_period: 'monthly'
          }
        );

        if (trendError) {
          console.error('Error fetching trend data:', trendError);
          setError(trendError.message);
          return;
        }

        // Transform data
        const transformedAttendance = (attendanceData || []).map((item: any) => ({
          nama_siswa: item.nama_siswa,
          nisn: item.nisn,
          kelas: item.kelas,
          total_hadir: Number(item.total_hadir),
          total_izin: Number(item.total_izin),
          total_sakit: Number(item.total_sakit),
          total_alpha: Number(item.total_alpha),
          total_pertemuan: Number(item.total_pertemuan),
          persentase_hadir: Number(item.persentase_hadir)
        }));

        const transformedClass = (classData || []).map((item: any) => ({
          nama_kelas: item.nama_kelas,
          total_hadir: Number(item.total_hadir),
          total_izin: Number(item.total_izin),
          total_sakit: Number(item.total_sakit),
          total_alpha: Number(item.total_alpha),
          persentase_hadir: Number(item.persentase_hadir)
        }));

        const transformedTrend = (trendData || []).map((item: any) => ({
          periode: item.periode,
          persentase_hadir: Number(item.persentase_hadir)
        }));

        // Calculate overview statistics
        const totalSiswa = transformedAttendance.length;
        const rataRataKehadiran = totalSiswa > 0 
          ? Math.round(transformedAttendance.reduce((acc, curr) => acc + curr.persentase_hadir, 0) / totalSiswa)
          : 0;
        const kehadiranTertinggi = totalSiswa > 0 
          ? Math.max(...transformedAttendance.map(item => item.persentase_hadir))
          : 0;
        const siswaAlphaTinggi = transformedAttendance.filter(item => 
          item.total_pertemuan > 0 && (item.total_alpha / item.total_pertemuan) > 0.05
        ).length;

        setStatistikKehadiran(transformedAttendance);
        setStatistikKelas(transformedClass);
        setTrendKehadiran(transformedTrend);
        setOverview({
          total_siswa: totalSiswa,
          rata_rata_kehadiran: rataRataKehadiran,
          kehadiran_tertinggi: kehadiranTertinggi,
          siswa_alpha_tinggi: siswaAlphaTinggi
        });

      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Terjadi kesalahan tidak terduga');
      } finally {
        setLoading(false);
      }
    };

    fetchLaporanKehadiran();
  }, [guruId, filters.tanggalMulai, filters.tanggalAkhir, filters.kelas, filters.mapel]);

  return {
    statistikKehadiran,
    statistikKelas,
    trendKehadiran,
    overview,
    loading,
    error
  };
};
