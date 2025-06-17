
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StatistikKehadiran {
  nama_siswa: string;
  nisn: string;
  kelas: string;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alpha: number;
  total_pertemuan: number;
  persentase_hadir: number;
}

export interface StatistikKelas {
  nama_kelas: string;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alpha: number;
  persentase_hadir: number;
}

export interface TrendKehadiran {
  periode: string;
  persentase_hadir: number;
}

export interface StatistikOverview {
  total_siswa: number;
  rata_rata_kehadiran: number;
  kehadiran_tertinggi: number;
  siswa_alpha_tinggi: number;
}

export const useLaporanKehadiran = (
  guruId: string,
  filters: {
    tanggalMulai: string;
    tanggalAkhir: string;
    kelas: string;
    mapel: string;
  }
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

export const useLaporanNilai = (
  guruId: string,
  filters: {
    tanggalMulai: string;
    tanggalAkhir: string;
    kelas: string;
    mapel: string;
  }
) => {
  const [statistikNilai, setStatistikNilai] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaporanNilai = async () => {
      if (!guruId) return;

      try {
        setLoading(true);
        setError(null);

        // Build query conditions
        let query = supabase
          .from('v_statistik_nilai')
          .select('*');

        // Add filters
        if (filters.tanggalMulai) {
          query = query.gte('tanggal_nilai', filters.tanggalMulai);
        }
        if (filters.tanggalAkhir) {
          query = query.lte('tanggal_nilai', filters.tanggalAkhir);
        }

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
          if (filters.mapel !== 'all') {
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

// Helper function to process nilai data
const processNilaiData = (nilaiData: any[]) => {
  const grouped = nilaiData.reduce((acc, curr) => {
    const key = curr.id_siswa;
    if (!acc[key]) {
      acc[key] = {
        nama_siswa: curr.siswa.nama_lengkap,
        nisn: curr.siswa.nisn,
        kelas: curr.siswa.kelas?.nama_kelas || '',
        nilai: []
      };
    }
    acc[key].nilai.push(curr.skor);
    return acc;
  }, {});

  return Object.values(grouped).map((student: any, index) => {
    const nilai = student.nilai;
    const rataRata = nilai.length > 0 ? nilai.reduce((a: number, b: number) => a + b, 0) / nilai.length : 0;
    const tertinggi = nilai.length > 0 ? Math.max(...nilai) : 0;
    const terendah = nilai.length > 0 ? Math.min(...nilai) : 0;

    return {
      nama_siswa: student.nama_siswa,
      nisn: student.nisn,
      kelas: student.kelas,
      rata_rata_nilai: Math.round(rataRata * 100) / 100,
      nilai_tertinggi: tertinggi,
      nilai_terendah: terendah,
      jumlah_tugas: nilai.length,
      tugas_selesai: nilai.length,
      ranking: index + 1
    };
  }).sort((a, b) => b.rata_rata_nilai - a.rata_rata_nilai).map((item, index) => ({
    ...item,
    ranking: index + 1
  }));
};
