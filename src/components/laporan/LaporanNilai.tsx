
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { UserSession } from '@/types';
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react';
import { useLaporanNilai } from '@/hooks/useLaporanData';
import ExportButtons from '../ExportButtons';

interface LaporanNilaiProps {
  userSession: UserSession;
  filters: {
    periode: string;
    tanggalMulai: string;
    tanggalAkhir: string;
    kelas: string;
    mapel: string;
    siswa: string;
  };
}

const LaporanNilai: React.FC<LaporanNilaiProps> = ({ userSession, filters }) => {
  const { statistikNilai, loading, error } = useLaporanNilai(userSession.guru.id_guru, {
    tanggalMulai: filters.tanggalMulai,
    tanggalAkhir: filters.tanggalAkhir,
    kelas: filters.kelas,
    mapel: filters.mapel
  });

  // Calculate statistics from real data
  const stats = React.useMemo(() => {
    if (!statistikNilai.length) {
      return {
        rataRataKelas: 0,
        nilaiTertinggi: 0,
        totalTugas: 0,
        tingkatPenyelesaian: 0
      };
    }

    const rataRataKelas = statistikNilai.reduce((acc, curr) => acc + curr.rata_rata_nilai, 0) / statistikNilai.length;
    const nilaiTertinggi = Math.max(...statistikNilai.map(s => s.nilai_tertinggi));
    const totalTugas = statistikNilai.reduce((acc, curr) => acc + curr.jumlah_tugas, 0);
    const totalSelesai = statistikNilai.reduce((acc, curr) => acc + curr.tugas_selesai, 0);
    const tingkatPenyelesaian = totalTugas > 0 ? Math.round((totalSelesai / totalTugas) * 100) : 0;

    return {
      rataRataKelas: Math.round(rataRataKelas * 10) / 10,
      nilaiTertinggi,
      totalTugas,
      tingkatPenyelesaian
    };
  }, [statistikNilai]);

  // Generate distribution data
  const distribusiNilai = React.useMemo(() => {
    if (!statistikNilai.length) return [];

    const ranges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '<60': 0
    };

    statistikNilai.forEach(siswa => {
      const nilai = siswa.rata_rata_nilai;
      if (nilai >= 90) ranges['90-100']++;
      else if (nilai >= 80) ranges['80-89']++;
      else if (nilai >= 70) ranges['70-79']++;
      else if (nilai >= 60) ranges['60-69']++;
      else ranges['<60']++;
    });

    return [
      { range: '90-100', jumlah: ranges['90-100'], fill: '#22c55e' },
      { range: '80-89', jumlah: ranges['80-89'], fill: '#3b82f6' },
      { range: '70-79', jumlah: ranges['70-79'], fill: '#eab308' },
      { range: '60-69', jumlah: ranges['60-69'], fill: '#f97316' },
      { range: '<60', jumlah: ranges['<60'], fill: '#ef4444' }
    ];
  }, [statistikNilai]);

  const getNilaiGrade = (nilai: number) => {
    if (nilai >= 90) return <Badge className="bg-green-500">A</Badge>;
    if (nilai >= 80) return <Badge className="bg-blue-500">B</Badge>;
    if (nilai >= 70) return <Badge className="bg-yellow-500">C</Badge>;
    if (nilai >= 60) return <Badge className="bg-orange-500">D</Badge>;
    return <Badge className="bg-red-500">E</Badge>;
  };

  const getRankingBadge = (ranking: number) => {
    if (ranking === 1) return <Badge className="bg-yellow-500">🥇 #{ranking}</Badge>;
    if (ranking === 2) return <Badge className="bg-gray-400">🥈 #{ranking}</Badge>;
    if (ranking === 3) return <Badge className="bg-amber-600">🥉 #{ranking}</Badge>;
    return <Badge variant="outline">#{ranking}</Badge>;
  };

  // Prepare export data
  const exportData = statistikNilai.map((siswa, index) => ({
    'No': index + 1,
    'Nama Siswa': siswa.nama_siswa,
    'NISN': siswa.nisn,
    'Kelas': siswa.kelas,
    'Rata-rata Nilai': siswa.rata_rata_nilai,
    'Nilai Tertinggi': siswa.nilai_tertinggi,
    'Nilai Terendah': siswa.nilai_terendah,
    'Tugas Selesai': `${siswa.tugas_selesai}/${siswa.jumlah_tugas}`,
    'Persentase Tugas (%)': Math.round((siswa.tugas_selesai / siswa.jumlah_tugas) * 100),
    'Ranking': siswa.ranking
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-8 w-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Terjadi kesalahan saat memuat data</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistik Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Kelas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rataRataKelas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nilai Tertinggi</p>
                <p className="text-2xl font-bold text-green-600">{stats.nilaiTertinggi}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tugas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalTugas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tingkat Penyelesaian</p>
                <p className="text-2xl font-bold text-purple-600">{stats.tingkatPenyelesaian}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafik */}
      {distribusiNilai.some(d => d.jumlah > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart Distribusi Nilai */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Nilai Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribusiNilai}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="jumlah"
                  >
                    {distribusiNilai.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabel Detail Siswa */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detail Nilai per Siswa</CardTitle>
            {exportData.length > 0 && (
              <ExportButtons 
                data={exportData}
                fileName={`laporan-nilai-${new Date().toISOString().split('T')[0]}`}
                columns={Object.keys(exportData[0] || {})}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {statistikNilai.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ranking</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Rata-rata</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Tertinggi</TableHead>
                  <TableHead>Terendah</TableHead>
                  <TableHead>Tugas Selesai</TableHead>
                  <TableHead>Persentase Tugas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistikNilai.map((siswa) => (
                  <TableRow key={siswa.nisn}>
                    <TableCell>{getRankingBadge(siswa.ranking)}</TableCell>
                    <TableCell className="font-medium">{siswa.nama_siswa}</TableCell>
                    <TableCell>{siswa.nisn}</TableCell>
                    <TableCell>{siswa.kelas}</TableCell>
                    <TableCell className="font-semibold">{siswa.rata_rata_nilai}</TableCell>
                    <TableCell>{getNilaiGrade(siswa.rata_rata_nilai)}</TableCell>
                    <TableCell className="text-green-600">{siswa.nilai_tertinggi}</TableCell>
                    <TableCell className="text-red-600">{siswa.nilai_terendah}</TableCell>
                    <TableCell>{siswa.tugas_selesai}/{siswa.jumlah_tugas}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{Math.round((siswa.tugas_selesai / siswa.jumlah_tugas) * 100)}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(siswa.tugas_selesai / siswa.jumlah_tugas) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data nilai untuk ditampilkan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanNilai;
