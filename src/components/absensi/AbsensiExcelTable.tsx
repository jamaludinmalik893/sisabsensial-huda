
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface RiwayatAbsensi {
  id_absensi: string;
  status: string;
  catatan?: string;
  created_at: string;
  siswa: {
    id_siswa: string;
    nama_lengkap: string;
    nisn: string;
  };
  jurnal_harian: {
    id_jurnal: string;
    tanggal_pelajaran: string;
    jam_pelajaran: number;
    judul_materi: string;
    mata_pelajaran: {
      nama_mapel: string;
    };
    kelas: {
      nama_kelas: string;
    };
  };
}

interface AbsensiExcelTableProps {
  riwayatAbsensi: RiwayatAbsensi[];
  loading: boolean;
  selectedMapel: string;
  selectedKelas: string;
  mapelList: Array<{id_mapel: string; nama_mapel: string}>;
  kelasList: Array<{id_kelas: string; nama_kelas: string}>;
}

const AbsensiExcelTable: React.FC<AbsensiExcelTableProps> = ({
  riwayatAbsensi,
  loading,
  selectedMapel,
  selectedKelas,
  mapelList,
  kelasList
}) => {
  // Group data by student and date
  const attendanceMatrix = useMemo(() => {
    const grouped: Record<string, {
      siswa: RiwayatAbsensi['siswa'];
      dates: Record<string, string>;
    }> = {};

    const allDates = new Set<string>();

    // Filter absensi
    const filteredAbsensi = riwayatAbsensi.filter(absensi => {
      const matchMapel = selectedMapel === 'all' || 
        absensi.jurnal_harian.mata_pelajaran.nama_mapel === mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
      const matchKelas = selectedKelas === 'all' || 
        absensi.jurnal_harian.kelas.nama_kelas === kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
      return matchMapel && matchKelas;
    });

    filteredAbsensi.forEach(absensi => {
      const siswaId = absensi.siswa.id_siswa;
      const tanggal = absensi.jurnal_harian.tanggal_pelajaran;

      allDates.add(tanggal);

      if (!grouped[siswaId]) {
        grouped[siswaId] = {
          siswa: absensi.siswa,
          dates: {}
        };
      }

      grouped[siswaId].dates[tanggal] = absensi.status;
    });

    const sortedDates = Array.from(allDates).sort();

    return {
      grouped: Object.values(grouped).sort((a, b) => a.siswa.nama_lengkap.localeCompare(b.siswa.nama_lengkap)),
      dates: sortedDates
    };
  }, [riwayatAbsensi, selectedMapel, selectedKelas, mapelList, kelasList]);

  const getStatusSymbol = (status?: string) => {
    switch (status) {
      case 'Hadir': return 'H';
      case 'Izin': return 'I';
      case 'Sakit': return 'S';
      case 'Alpha': return 'A';
      default: return '';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Hadir': return 'bg-green-100 text-green-800';
      case 'Izin': return 'bg-yellow-100 text-yellow-800';
      case 'Sakit': return 'bg-blue-100 text-blue-800';
      case 'Alpha': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const calculateSummary = (studentData: any) => {
    const attendances = Object.values(studentData.dates);
    return {
      hadir: attendances.filter(status => status === 'Hadir').length,
      izin: attendances.filter(status => status === 'Izin').length,
      sakit: attendances.filter(status => status === 'Sakit').length,
      alpha: attendances.filter(status => status === 'Alpha').length,
      total: attendances.length
    };
  };

  const exportToExcel = () => {
    const exportData = [];
    
    // Header information
    const mapelName = selectedMapel === 'all' ? 'Semua' : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
    const kelasName = selectedKelas === 'all' ? 'Semua' : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
    
    exportData.push(['REKAPITULASI ABSENSI SISWA']);
    exportData.push(['SMK AL-HUDA KOTA KEDIRI']);
    exportData.push([]);
    exportData.push([`Filter: Mata Pelajaran: ${mapelName} | Kelas: ${kelasName}`]);
    exportData.push([`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`]);
    exportData.push([]);

    // Header row
    const headerRow = ['No', 'Nama Siswa'];
    attendanceMatrix.dates.forEach(date => {
      headerRow.push(new Date(date).toLocaleDateString('id-ID'));
    });
    headerRow.push('H', 'I', 'S', 'A', '%');
    exportData.push(headerRow);

    // Data rows
    attendanceMatrix.grouped.forEach((student, index) => {
      const summary = calculateSummary(student);
      const percentage = summary.total > 0 ? Math.round((summary.hadir / summary.total) * 100) : 0;
      
      const row = [index + 1, student.siswa.nama_lengkap];
      
      attendanceMatrix.dates.forEach(date => {
        const status = student.dates[date];
        row.push(getStatusSymbol(status));
      });
      
      row.push(summary.hadir, summary.izin, summary.sakit, summary.alpha, `${percentage}%`);
      exportData.push(row);
    });

    exportData.push([]);
    exportData.push(['Keterangan:']);
    exportData.push(['H = Hadir | A = Alpha (Tidak Hadir) | I = Izin | S = Sakit | % = Persentase Kehadiran']);

    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekapitulasi Absensi');
    
    XLSX.writeFile(workbook, `Rekapitulasi_Absensi_${kelasName}_${mapelName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Memuat data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>REKAPITULASI ABSENSI SISWA</CardTitle>
            <p className="text-sm text-gray-600 mt-1">SMK AL-HUDA KOTA KEDIRI</p>
            <div className="text-sm text-gray-500 mt-2">
              <p>Filter: Mata Pelajaran: {selectedMapel === 'all' ? 'Semua' : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel} | 
                 Kelas: {selectedKelas === 'all' ? 'Semua' : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas}</p>
              <p>Tanggal Export: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>
          <Button onClick={exportToExcel} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead className="min-w-32">Nama Siswa</TableHead>
                {attendanceMatrix.dates.map(date => (
                  <TableHead key={date} className="text-center w-20">
                    {new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}
                  </TableHead>
                ))}
                <TableHead className="text-center w-12">H</TableHead>
                <TableHead className="text-center w-12">I</TableHead>
                <TableHead className="text-center w-12">S</TableHead>
                <TableHead className="text-center w-12">A</TableHead>
                <TableHead className="text-center w-12">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceMatrix.grouped.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7 + attendanceMatrix.dates.length} className="text-center py-8 text-gray-500">
                    Tidak ada data absensi
                  </TableCell>
                </TableRow>
              ) : (
                attendanceMatrix.grouped.map((student, index) => {
                  const summary = calculateSummary(student);
                  const percentage = summary.total > 0 ? Math.round((summary.hadir / summary.total) * 100) : 0;
                  
                  return (
                    <TableRow key={student.siswa.id_siswa}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{student.siswa.nama_lengkap}</TableCell>
                      {attendanceMatrix.dates.map(date => {
                        const status = student.dates[date];
                        return (
                          <TableCell key={date} className="text-center">
                            <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${getStatusColor(status)}`}>
                              {getStatusSymbol(status)}
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-medium">{summary.hadir}</TableCell>
                      <TableCell className="text-center font-medium">{summary.izin}</TableCell>
                      <TableCell className="text-center font-medium">{summary.sakit}</TableCell>
                      <TableCell className="text-center font-medium">{summary.alpha}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={percentage >= 75 ? 'default' : 'destructive'} className="text-xs">
                          {percentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">Keterangan:</p>
          <p className="text-xs text-gray-600">
            H = Hadir | A = Alpha (Tidak Hadir) | I = Izin | S = Sakit | % = Persentase Kehadiran
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbsensiExcelTable;
