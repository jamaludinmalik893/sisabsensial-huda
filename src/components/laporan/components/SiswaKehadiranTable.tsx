
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatistikKehadiran } from '@/hooks/useLaporanData';
import ExportButtons from '../../ExportButtons';

interface SiswaKehadiranTableProps {
  statistikKehadiran: StatistikKehadiran[];
  loading?: boolean;
}

const SiswaKehadiranTable: React.FC<SiswaKehadiranTableProps> = ({ 
  statistikKehadiran, 
  loading = false 
}) => {
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detail Kehadiran per Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Detail Kehadiran per Siswa</CardTitle>
          {exportData.length > 0 && (
            <ExportButtons 
              data={exportData}
              fileName={`laporan-kehadiran-${new Date().toISOString().split('T')[0]}`}
              columns={Object.keys(exportData[0] || {})}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {statistikKehadiran.length > 0 ? (
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data kehadiran untuk ditampilkan
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SiswaKehadiranTable;
