
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, GraduationCap, TrendingUp, Award, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const LaporanAkademikPage: React.FC<LaporanAkademikPageProps> = ({ userSession }) => {
  const [statistikSiswa, setStatistikSiswa] = useState<StatistikSiswa[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userSession.isWaliKelas && userSession.kelasWali) {
      loadStatistikAkademik();
    }
  }, [userSession]);

  const loadStatistikAkademik = async () => {
    if (!userSession.kelasWali) return;
    
    setLoading(true);
    try {
      // Load siswa kelas
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

      // Combine data
      const combinedData = (siswaData || []).map(siswa => {
        // Aggregate kehadiran data for this student
        const kehadiranSiswa = kehadiranData?.filter(k => k.id_siswa === siswa.id_siswa) || [];
        const totalHadir = kehadiranSiswa.reduce((sum, k) => sum + (k.total_hadir || 0), 0);
        const totalIzin = kehadiranSiswa.reduce((sum, k) => sum + (k.total_izin || 0), 0);
        const totalSakit = kehadiranSiswa.reduce((sum, k) => sum + (k.total_sakit || 0), 0);
        const totalAlpha = kehadiranSiswa.reduce((sum, k) => sum + (k.total_alpha || 0), 0);
        const totalPertemuan = kehadiranSiswa.reduce((sum, k) => sum + (k.total_pertemuan || 0), 0);
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
          ...siswa,
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
      </div>

      {/* Statistik Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{stats.totalSiswa}</div>
            <div className="text-sm text-gray-500">Total Siswa</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.siswaLakiLaki}</div>
            <div className="text-sm text-gray-500">Laki-laki</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.siswaPerempuan}</div>
            <div className="text-sm text-gray-500">Perempuan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{stats.rataKehadiran}%</div>
            <div className="text-sm text-gray-500">Rata Kehadiran</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{stats.rataNilai}</div>
            <div className="text-sm text-gray-500">Rata Nilai</div>
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
                  {statistikSiswa.map((siswa) => (
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
          
          {!loading && statistikSiswa.length === 0 && (
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
