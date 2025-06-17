
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { UserSession } from '@/types';
import { TrendingUp, Award, BookOpen, Target } from 'lucide-react';
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

interface StatistikNilai {
  nama_siswa: string;
  nisn: string;
  kelas: string;
  rata_rata_nilai: number;
  nilai_tertinggi: number;
  nilai_terendah: number;
  jumlah_tugas: number;
  tugas_selesai: number;
  ranking: number;
}

const LaporanNilai: React.FC<LaporanNilaiProps> = ({ userSession, filters }) => {
  const [statistikNilai, setStatistikNilai] = useState<StatistikNilai[]>([]);

  // Data dummy untuk contoh
  const dummyData: StatistikNilai[] = [
    {
      nama_siswa: "Ahmad Rizki",
      nisn: "1234567890",
      kelas: "X RPL 1",
      rata_rata_nilai: 88.5,
      nilai_tertinggi: 95,
      nilai_terendah: 80,
      jumlah_tugas: 20,
      tugas_selesai: 18,
      ranking: 3
    },
    {
      nama_siswa: "Siti Nurhaliza",
      nisn: "1234567891",
      kelas: "X RPL 1",
      rata_rata_nilai: 92.3,
      nilai_tertinggi: 98,
      nilai_terendah: 85,
      jumlah_tugas: 20,
      tugas_selesai: 20,
      ranking: 1
    },
    {
      nama_siswa: "Budi Santoso",
      nisn: "1234567892",
      kelas: "X RPL 1",
      rata_rata_nilai: 85.7,
      nilai_tertinggi: 92,
      nilai_terendah: 75,
      jumlah_tugas: 20,
      tugas_selesai: 17,
      ranking: 5
    }
  ];

  useEffect(() => {
    setStatistikNilai(dummyData);
  }, [filters]);

  // Data untuk distribusi nilai
  const distribusiNilai = [
    { range: '90-100', jumlah: 15, fill: '#22c55e' },
    { range: '80-89', jumlah: 25, fill: '#3b82f6' },
    { range: '70-79', jumlah: 18, fill: '#eab308' },
    { range: '60-69', jumlah: 8, fill: '#f97316' },
    { range: '<60', jumlah: 4, fill: '#ef4444' }
  ];

  // Data trend nilai per bulan
  const trendNilai = [
    { bulan: 'Jan', rata_rata: 82 },
    { bulan: 'Feb', rata_rata: 85 },
    { bulan: 'Mar', rata_rata: 87 },
    { bulan: 'Apr', rata_rata: 84 },
    { bulan: 'Mei', rata_rata: 88 },
    { bulan: 'Jun', rata_rata: 89 }
  ];

  // Data nilai per mata pelajaran
  const nilaiMapel = [
    { mapel: 'Matematika', rata_rata: 85.5, tertinggi: 95, terendah: 70 },
    { mapel: 'Pemrograman', rata_rata: 88.2, tertinggi: 98, terendah: 75 },
    { mapel: 'Basis Data', rata_rata: 86.8, tertinggi: 94, terendah: 72 },
    { mapel: 'PKK', rata_rata: 89.1, tertinggi: 96, terendah: 78 }
  ];

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
                <p className="text-2xl font-bold text-gray-900">86.8</p>
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
                <p className="text-2xl font-bold text-green-600">98</p>
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
                <p className="text-2xl font-bold text-blue-600">420</p>
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
                <p className="text-2xl font-bold text-purple-600">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafik */}
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

        {/* Line Chart Trend Nilai */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Nilai Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendNilai}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rata_rata" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart Nilai per Mata Pelajaran */}
      <Card>
        <CardHeader>
          <CardTitle>Nilai per Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={nilaiMapel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mapel" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rata_rata" fill="#3b82f6" name="Rata-rata" />
              <Bar dataKey="tertinggi" fill="#22c55e" name="Tertinggi" />
              <Bar dataKey="terendah" fill="#ef4444" name="Terendah" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabel Detail Siswa */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detail Nilai per Siswa</CardTitle>
            <ExportButtons 
              data={exportData}
              fileName={`laporan-nilai-${new Date().toISOString().split('T')[0]}`}
              columns={Object.keys(exportData[0] || {})}
            />
          </div>
        </CardHeader>
        <CardContent>
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
              {statistikNilai
                .sort((a, b) => a.ranking - b.ranking)
                .map((siswa) => (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanNilai;
