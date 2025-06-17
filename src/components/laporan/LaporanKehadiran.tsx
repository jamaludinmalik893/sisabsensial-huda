
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { UserSession } from '@/types';
import { Download, TrendingUp, Users, Calendar } from 'lucide-react';
import ExportButtons from '../ExportButtons';

interface LaporanKehadiranProps {
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

interface StatistikKehadiran {
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

const LaporanKehadiran: React.FC<LaporanKehadiranProps> = ({ userSession, filters }) => {
  const [statistikKehadiran, setStatistikKehadiran] = useState<StatistikKehadiran[]>([]);
  const [loading, setLoading] = useState(false);

  // Data dummy untuk contoh
  const dummyData: StatistikKehadiran[] = [
    {
      nama_siswa: "Ahmad Rizki",
      nisn: "1234567890",
      kelas: "X RPL 1",
      total_hadir: 45,
      total_izin: 3,
      total_sakit: 2,
      total_alpha: 0,
      total_pertemuan: 50,
      persentase_hadir: 90
    },
    {
      nama_siswa: "Siti Nurhaliza",
      nisn: "1234567891",
      kelas: "X RPL 1",
      total_hadir: 48,
      total_izin: 1,
      total_sakit: 1,
      total_alpha: 0,
      total_pertemuan: 50,
      persentase_hadir: 96
    },
    {
      nama_siswa: "Budi Santoso",
      nisn: "1234567892",
      kelas: "X RPL 1",
      total_hadir: 42,
      total_izin: 2,
      total_sakit: 3,
      total_alpha: 3,
      total_pertemuan: 50,
      persentase_hadir: 84
    }
  ];

  useEffect(() => {
    setStatistikKehadiran(dummyData);
  }, [filters]);

  // Data untuk pie chart
  const pieData = [
    { name: 'Hadir', value: 87, fill: '#22c55e' },
    { name: 'Izin', value: 8, fill: '#eab308' },
    { name: 'Sakit', value: 3, fill: '#3b82f6' },
    { name: 'Alpha', value: 2, fill: '#ef4444' }
  ];

  // Data untuk trend kehadiran
  const trendData = [
    { bulan: 'Jan', persentase: 85 },
    { bulan: 'Feb', persentase: 88 },
    { bulan: 'Mar', persentase: 92 },
    { bulan: 'Apr', persentase: 87 },
    { bulan: 'Mei', persentase: 90 },
    { bulan: 'Jun', persentase: 89 }
  ];

  // Data untuk kehadiran per mata pelajaran
  const kehadiranMapelData = [
    { mapel: 'Matematika', hadir: 92, izin: 5, sakit: 2, alpha: 1 },
    { mapel: 'Pemrograman', hadir: 89, izin: 7, sakit: 3, alpha: 1 },
    { mapel: 'Basis Data', hadir: 91, izin: 6, sakit: 2, alpha: 1 },
    { mapel: 'PKK', hadir: 88, izin: 8, sakit: 3, alpha: 1 }
  ];

  const getStatusBadge = (persentase: number) => {
    if (persentase >= 90) return <Badge className="bg-green-500">Sangat Baik</Badge>;
    if (persentase >= 80) return <Badge className="bg-blue-500">Baik</Badge>;
    if (persentase >= 70) return <Badge className="bg-yellow-500">Cukup</Badge>;
    return <Badge className="bg-red-500">Kurang</Badge>;
  };

  // Prepare export data
  const exportData = statistikKehadiran.map((siswa, index) => ({
    'No': index + 1,
    'Nama Siswa': siswa.nama_siswa,
    'NISN': siswa.nisn,
    'Kelas': siswa.kelas,
    'Hadir': siswa.total_hadir,
    'Izin': siswa.total_izin,
    'Sakit': siswa.total_sakit,
    'Alpha': siswa.total_alpha,
    'Total Pertemuan': siswa.total_pertemuan,
    'Persentase Hadir (%)': siswa.persentase_hadir
  }));

  return (
    <div className="space-y-6">
      {/* Statistik Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-gray-900">150</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Kehadiran</p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kehadiran Tertinggi</p>
                <p className="text-2xl font-bold text-green-600">96%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Siswa Alpha > 5%</p>
                <p className="text-2xl font-bold text-red-600">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart Distribusi Kehadiran */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Status Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart Trend Kehadiran */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Kehadiran Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="persentase" stroke="#22c55e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart Kehadiran per Mata Pelajaran */}
      <Card>
        <CardHeader>
          <CardTitle>Kehadiran per Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={kehadiranMapelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mapel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hadir" stackId="a" fill="#22c55e" name="Hadir" />
              <Bar dataKey="izin" stackId="a" fill="#eab308" name="Izin" />
              <Bar dataKey="sakit" stackId="a" fill="#3b82f6" name="Sakit" />
              <Bar dataKey="alpha" stackId="a" fill="#ef4444" name="Alpha" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabel Detail Siswa */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Detail Kehadiran per Siswa</CardTitle>
            <ExportButtons 
              data={exportData}
              fileName={`laporan-kehadiran-${new Date().toISOString().split('T')[0]}`}
              columns={Object.keys(exportData[0] || {})}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>NISN</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Hadir</TableHead>
                <TableHead>Izin</TableHead>
                <TableHead>Sakit</TableHead>
                <TableHead>Alpha</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Persentase</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistikKehadiran.map((siswa, index) => (
                <TableRow key={siswa.nisn}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{siswa.nama_siswa}</TableCell>
                  <TableCell>{siswa.nisn}</TableCell>
                  <TableCell>{siswa.kelas}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{siswa.total_hadir}</TableCell>
                  <TableCell className="text-yellow-600">{siswa.total_izin}</TableCell>
                  <TableCell className="text-blue-600">{siswa.total_sakit}</TableCell>
                  <TableCell className="text-red-600">{siswa.total_alpha}</TableCell>
                  <TableCell>{siswa.total_pertemuan}</TableCell>
                  <TableCell className="font-semibold">{siswa.persentase_hadir}%</TableCell>
                  <TableCell>{getStatusBadge(siswa.persentase_hadir)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanKehadiran;
