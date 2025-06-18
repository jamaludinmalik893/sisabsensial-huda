

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, TrendingUp, Award, FileText, Download, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LaporanAkademikFilters from './LaporanAkademikFilters';

interface LaporanAkademikPageProps {
  userSession: UserSession;
}

interface StatistikSiswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  jenis_kelamin: string;
  // Statistik Kehadiran
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alpha: number;
  total_pertemuan: number;
  persentase_kehadiran: number;
  // Statistik Nilai
  rata_rata_nilai: number;
  jumlah_tugas: number;
  nilai_tertinggi: number;
  nilai_terendah: number;
  // Catatan
  catatan_khusus: string[];
}

interface StatistikKelas {
  total_siswa: number;
  siswa_laki_laki: number;
  siswa_perempuan: number;
  rata_kehadiran: number;
  rata_nilai: number;
  siswa_kehadiran_baik: number;
  siswa_nilai_baik: number;
  siswa_perlu_perhatian: number;
}

const LaporanAkademikPage: React.FC<LaporanAkademikPageProps> = ({ userSession }) => {
  const [statistikSiswa, setStatistikSiswa] = useState<StatistikSiswa[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<StatistikSiswa[]>([]);
  const [statistikKelas, setStatistikKelas] = useState<StatistikKelas>({
    total_siswa: 0,
    siswa_laki_laki: 0,
    siswa_perempuan: 0,
    rata_kehadiran: 0,
    rata_nilai: 0,
    siswa_kehadiran_baik: 0,
    siswa_nilai_baik: 0,
    siswa_perlu_perhatian: 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    periode: 'semester',
    tanggalMulai: '',
    tanggalAkhir: '',
    jenisKelamin: 'all',
    statusKehadiran: 'all',
    statusNilai: 'all'
  });

  useEffect(() => {
    if (userSession.isWaliKelas && userSession.kelasWali) {
      loadStatistikAkademik();
    }
  }, [userSession, filters.tanggalMulai, filters.tanggalAkhir]);

  useEffect(() => {
    applyFilters();
  }, [statistikSiswa, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    let filtered = [...statistikSiswa];

    // Filter by gender
    if (filters.jenisKelamin !== 'all') {
      filtered = filtered.filter(siswa => siswa.jenis_kelamin === filters.jenisKelamin);
    }

    // Filter by attendance status
    if (filters.statusKehadiran !== 'all') {
      switch (filters.statusKehadiran) {
        case 'baik':
          filtered = filtered.filter(siswa => siswa.persentase_kehadiran >= 90);
          break;
        case 'cukup':
          filtered = filtered.filter(siswa => siswa.persentase_kehadiran >= 80 && siswa.persentase_kehadiran < 90);
          break;
        case 'kurang':
          filtered = filtered.filter(siswa => siswa.persentase_kehadiran < 80);
          break;
      }
    }

    // Filter by grade status
    if (filters.statusNilai !== 'all') {
      switch (filters.statusNilai) {
        case 'sangat-baik':
          filtered = filtered.filter(siswa => siswa.rata_rata_nilai >= 85);
          break;
        case 'baik':
          filtered = filtered.filter(siswa => siswa.rata_rata_nilai >= 75 && siswa.rata_rata_nilai < 85);
          break;
        case 'cukup':
          filtered = filtered.filter(siswa => siswa.rata_rata_nilai >= 65 && siswa.rata_rata_nilai < 75);
          break;
        case 'kurang':
          filtered = filtered.filter(siswa => siswa.rata_rata_nilai < 65);
          break;
      }
    }

    setFilteredSiswa(filtered);
    calculateStatistikKelas(filtered);
  };

  const calculateStatistikKelas = (siswaData: StatistikSiswa[]) => {
    const total = siswaData.length;
    const lakiLaki = siswaData.filter(s => s.jenis_kelamin === 'Laki-laki').length;
    const perempuan = siswaData.filter(s => s.jenis_kelamin === 'Perempuan').length;
    const rataKehadiran = total > 0 
      ? Math.round(siswaData.reduce((sum, s) => sum + s.persentase_kehadiran, 0) / total)
      : 0;
    const rataNilai = total > 0
      ? Math.round(siswaData.reduce((sum, s) => sum + s.rata_rata_nilai, 0) / total * 100) / 100
      : 0;
    const kehadiranBaik = siswaData.filter(s => s.persentase_kehadiran >= 90).length;
    const nilaiBaik = siswaData.filter(s => s.rata_rata_nilai >= 75).length;
    const perluPerhatian = siswaData.filter(s => 
      s.persentase_kehadiran < 80 || s.rata_rata_nilai < 65 || s.total_alpha > 5
    ).length;

    setStatistikKelas({
      total_siswa: total,
      siswa_laki_laki: lakiLaki,
      siswa_perempuan: perempuan,
      rata_kehadiran: rataKehadiran,
      rata_nilai: rataNilai,
      siswa_kehadiran_baik: kehadiranBaik,
      siswa_nilai_baik: nilaiBaik,
      siswa_perlu_perhatian: perluPerhatian
    });
  };

  const loadStatistikAkademik = async () => {
    if (!userSession.kelasWali) return;
    
    setLoading(true);
    try {
      // Load siswa kelas with complete data
      const { data: siswaData, error: siswaError } = await supabase
        .from('siswa')
        .select('id_siswa, nama_lengkap, nisn, jenis_kelamin')
        .eq('id_kelas', userSession.kelasWali.id_kelas)
        .order('nama_lengkap');

      if (siswaError) throw siswaError;

      // Load statistik kehadiran per siswa
      const { data: kehadiranData, error: kehadiranError } = await supabase
        .from('v_statistik_kehadiran_siswa')
        .select('*')
        .eq('nama_kelas', userSession.kelasWali.nama_kelas);

      if (kehadiranError) throw kehadiranError;

      // Load statistik nilai per siswa
      const { data: nilaiData, error: nilaiError } = await supabase
        .from('v_statistik_nilai')
        .select('*')
        .eq('nama_kelas', userSession.kelasWali.nama_kelas);

      if (nilaiError) throw nilaiError;

      // Combine data with proper mapping
      const combinedData: StatistikSiswa[] = (siswaData || []).map(siswa => {
        // Aggregate kehadiran data for this student
        const kehadiranSiswa = kehadiranData?.filter(k => k.id_siswa === siswa.id_siswa) || [];
        const totalHadir = kehadiranSiswa.reduce((sum, k) => sum + (k.total_hadir || 0), 0);
        const totalIzin = kehadiranSiswa.reduce((sum, k) => sum + (k.total_izin || 0), 0);
        const totalSakit = kehadiranSiswa.reduce((sum, k) => sum + (k.total_sakit || 0), 0);
        const totalAlpha = kehadiranSiswa.reduce((sum, k) => sum + (k.total_alpha || 0), 0);
        const totalPertemuan = kehadiranSiswa.reduce((sum, k) => sum + (k.total_pertemuan || 0), 0);
        // Use persentase_hadir from database view
        const persentaseKehadiran = totalPertemuan > 0 ? Math.round((totalHadir / totalPertemuan) * 100) : 0;

        // Aggregate nilai data for this student
        const nilaiSiswa = nilaiData?.filter(n => n.id_siswa === siswa.id_siswa) || [];
        const rataRataNilai = nilaiSiswa.length > 0 
          ? Math.round(nilaiSiswa.reduce((sum, n) => sum + (n.rata_rata || 0), 0) / nilaiSiswa.length * 100) / 100
          : 0;
        const jumlahTugas = nilaiSiswa.reduce((sum, n) => sum + (n.jumlah_nilai || 0), 0);
        const nilaiTertinggi = nilaiSiswa.length > 0 
          ? Math.max(...nilaiSiswa.map(n => n.nilai_maksimum || 0))
          : 0;
        const nilaiTerendah = nilaiSiswa.length > 0 
          ? Math.min(...nilaiSiswa.map(n => n.nilai_minimum || 100))
          : 0;

        // Generate catatan berdasarkan performa
        const catatan: string[] = [];
        if (persentaseKehadiran < 80) {
          catatan.push('Kehadiran perlu ditingkatkan');
        }
        if (rataRataNilai < 70) {
          catatan.push('Nilai akademik perlu perhatian khusus');
        }
        if (totalAlpha > 5) {
          catatan.push('Tingkat alpha tinggi - perlu tindak lanjut');
        }
        if (rataRataNilai >= 85 && persentaseKehadiran >= 90) {
          catatan.push('Prestasi sangat baik');
        }

        return {
          id_siswa: siswa.id_siswa,
          nama_lengkap: siswa.nama_lengkap,
          nisn: siswa.nisn,
          jenis_kelamin: siswa.jenis_kelamin,
          total_hadir: totalHadir,
          total_izin: totalIzin,
          total_sakit: totalSakit,
          total_alpha: totalAlpha,
          total_pertemuan: totalPertemuan,
          persentase_kehadiran: persentaseKehadiran,
          rata_rata_nilai: rataRataNilai,
          jumlah_tugas: jumlahTugas,
          nilai_tertinggi: nilaiTertinggi,
          nilai_terendah: nilaiTerendah,
          catatan_khusus: catatan
        };
      });

      setStatistikSiswa(combinedData);
    } catch (error) {
      console.error('Error loading statistik akademik:', error);
      toast({
        title: "Error",
        description: "Gagal memuat statistik akademik",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPerformanceBadge = (kehadiran: number, nilai: number) => {
    if (kehadiran >= 90 && nilai >= 85) return <Badge className="bg-green-500">Sangat Baik</Badge>;
    if (kehadiran >= 80 && nilai >= 75) return <Badge className="bg-blue-500">Baik</Badge>;
    if (kehadiran >= 70 && nilai >= 65) return <Badge className="bg-yellow-500">Cukup</Badge>;
    return <Badge className="bg-red-500">Perlu Perhatian</Badge>;
  };

  const getOverallStats = () => {
    const totalSiswa = statistikSiswa.length;
    const siswaLakiLaki = statistikSiswa.filter(s => s.jenis_kelamin === 'Laki-laki').length;
    const siswaPerempuan = statistikSiswa.filter(s => s.jenis_kelamin === 'Perempuan').length;
    const rataKehadiran = totalSiswa > 0 
      ? Math.round(statistikSiswa.reduce((sum, s) => sum + s.persentase_kehadiran, 0) / totalSiswa)
      : 0;
    const rataNilai = totalSiswa > 0
      ? Math.round(statistikSiswa.reduce((sum, s) => sum + s.rata_rata_nilai, 0) / totalSiswa * 100) / 100
      : 0;

    return { totalSiswa, siswaLakiLaki, siswaPerempuan, rataKehadiran, rataNilai };
  };

  const handleExportData = () => {
    // Create CSV content
    const headers = [
      'No', 'NISN', 'Nama Lengkap', 'Jenis Kelamin', 
      'Total Hadir', 'Total Izin', 'Total Sakit', 'Total Alpha', 
      'Persentase Kehadiran (%)', 'Rata-rata Nilai', 'Jumlah Tugas',
      'Nilai Tertinggi', 'Nilai Terendah', 'Catatan'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredSiswa.map((siswa, index) => [
        index + 1,
        siswa.nisn,
        `"${siswa.nama_lengkap}"`,
        siswa.jenis_kelamin,
        siswa.total_hadir,
        siswa.total_izin,
        siswa.total_sakit,
        siswa.total_alpha,
        siswa.persentase_kehadiran,
        siswa.rata_rata_nilai,
        siswa.jumlah_tugas,
        siswa.nilai_tertinggi,
        siswa.nilai_terendah,
        `"${siswa.catatan_khusus.join('; ')}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-akademik-${userSession.kelasWali?.nama_kelas}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sukses",
      description: "Data laporan berhasil diexport",
    });
  };

  if (!userSession.isWaliKelas) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Anda bukan wali kelas dari kelas manapun.
          </p>
        </div>
      </div>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laporan Akademik Wali Kelas</h1>
          <p className="text-gray-600">Kelas {userSession.kelasWali?.nama_kelas}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportData} variant="outline" disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Component */}
      <LaporanAkademikFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onRefresh={loadStatistikAkademik}
        loading={loading}
      />

      {/* Enhanced Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{statistikKelas.total_siswa}</div>
            <div className="text-sm text-gray-500">Total Siswa</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statistikKelas.siswa_laki_laki}</div>
            <div className="text-sm text-gray-500">Laki-laki</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{statistikKelas.siswa_perempuan}</div>
            <div className="text-sm text-gray-500">Perempuan</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{statistikKelas.rata_kehadiran}%</div>
            <div className="text-sm text-gray-500">Rata Kehadiran</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{statistikKelas.rata_nilai}</div>
            <div className="text-sm text-gray-500">Rata Nilai</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statistikKelas.siswa_kehadiran_baik}</div>
            <div className="text-sm text-gray-500">Kehadiran Baik</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{statistikKelas.siswa_perlu_perhatian}</div>
            <div className="text-sm text-gray-500">Perlu Perhatian</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Statistik Siswa */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Akademik per Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kehadiran</TableHead>
                    <TableHead>Persentase Nilai</TableHead>
                    <TableHead>Prestasi</TableHead>
                    <TableHead>Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSiswa.map((siswa) => (
                    <TableRow key={siswa.id_siswa}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(siswa.nama_lengkap)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{siswa.nama_lengkap}</div>
                            <div className="text-sm text-gray-500">{siswa.nisn}</div>
                            <Badge variant={siswa.jenis_kelamin === 'Laki-laki' ? 'default' : 'secondary'} className="text-xs">
                              {siswa.jenis_kelamin}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{siswa.persentase_kehadiran}%</span>
                            <span className="text-gray-500">
                              {siswa.total_hadir}/{siswa.total_pertemuan}
                            </span>
                          </div>
                          <Progress value={siswa.persentase_kehadiran} className="h-2" />
                          <div className="grid grid-cols-4 gap-1 text-xs">
                            <span className="text-green-600">H: {siswa.total_hadir}</span>
                            <span className="text-yellow-600">I: {siswa.total_izin}</span>
                            <span className="text-blue-600">S: {siswa.total_sakit}</span>
                            <span className="text-red-600">A: {siswa.total_alpha}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {siswa.rata_rata_nilai > 0 ? siswa.rata_rata_nilai : '-'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {siswa.jumlah_tugas} tugas
                          </div>
                          {siswa.nilai_tertinggi > 0 && (
                            <div className="text-xs text-gray-400">
                              Range: {siswa.nilai_terendah} - {siswa.nilai_tertinggi}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPerformanceBadge(siswa.persentase_kehadiran, siswa.rata_rata_nilai)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {siswa.catatan_khusus.length > 0 ? (
                            siswa.catatan_khusus.map((catatan, index) => (
                              <div key={index} className="flex items-center gap-1 text-sm">
                                <FileText className="h-3 w-3 text-gray-400" />
                                <span>{catatan}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">Tidak ada catatan khusus</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!loading && filteredSiswa.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data siswa di kelas ini
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanAkademikPage;

