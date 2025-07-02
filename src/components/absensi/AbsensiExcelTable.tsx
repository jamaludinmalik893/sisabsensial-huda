
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
  // Group data by student and date with jam_pelajaran
  const attendanceMatrix = useMemo(() => {
    const grouped: Record<string, {
      siswa: RiwayatAbsensi['siswa'];
      dates: Record<string, Record<number, string>>;
    }> = {};

    const allDates = new Set<string>();
    const allJamPelajaran = new Set<number>();

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
      const jamPelajaran = absensi.jurnal_harian.jam_pelajaran;

      allDates.add(tanggal);
      allJamPelajaran.add(jamPelajaran);

      if (!grouped[siswaId]) {
        grouped[siswaId] = {
          siswa: absensi.siswa,
          dates: {}
        };
      }

      if (!grouped[siswaId].dates[tanggal]) {
        grouped[siswaId].dates[tanggal] = {};
      }

      grouped[siswaId].dates[tanggal][jamPelajaran] = absensi.status;
    });

    const sortedDates = Array.from(allDates).sort();
    const sortedJamPelajaran = Array.from(allJamPelajaran).sort((a, b) => a - b);

    return {
      grouped: Object.values(grouped).sort((a, b) => a.siswa.nama_lengkap.localeCompare(b.siswa.nama_lengkap)),
      dates: sortedDates,
      jamPelajaran: sortedJamPelajaran
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

  const exportToExcel = () => {
    const exportData = [];
    
    // Header row
    const headerRow = ['No', 'NISN', 'Nama Siswa'];
    attendanceMatrix.dates.forEach(date => {
      attendanceMatrix.jamPelajaran.forEach(jp => {
        headerRow.push(`${new Date(date).toLocaleDateString('id-ID')} JP${jp}`);
      });
    });
    exportData.push(headerRow);

    // Data rows
    attendanceMatrix.grouped.forEach((student, index) => {
      const row = [index + 1, student.siswa.nisn, student.siswa.nama_lengkap];
      
      attendanceMatrix.dates.forEach(date => {
        attendanceMatrix.jamPelajaran.forEach(jp => {
          const status = student.dates[date]?.[jp];
          row.push(getStatusSymbol(status));
        });
      });
      
      exportData.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Absensi');
    
    const mapelName = selectedMapel === 'all' ? 'Semua' : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
    const kelasName = selectedKelas === 'all' ? 'Semua' : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
    
    XLSX.writeFile(workbook, `Riwayat_Absensi_${kelasName}_${mapelName}.xlsx`);
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
          <CardTitle>Riwayat Absensi (Format Excel)</CardTitle>
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
                <TableHead className="w-20">NISN</TableHead>
                <TableHead className="min-w-32">Nama Siswa</TableHead>
                {attendanceMatrix.dates.map(date => 
                  attendanceMatrix.jamPelajaran.map(jp => (
                    <TableHead key={`${date}-${jp}`} className="text-center w-16">
                      <div className="text-xs">
                        <div>{new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })}</div>
                        <div>JP{jp}</div>
                      </div>
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceMatrix.grouped.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3 + (attendanceMatrix.dates.length * attendanceMatrix.jamPelajaran.length)} className="text-center py-8 text-gray-500">
                    Tidak ada data absensi
                  </TableCell>
                </TableRow>
              ) : (
                attendanceMatrix.grouped.map((student, index) => (
                  <TableRow key={student.siswa.id_siswa}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.siswa.nisn}</TableCell>
                    <TableCell className="font-medium">{student.siswa.nama_lengkap}</TableCell>
                    {attendanceMatrix.dates.map(date => 
                      attendanceMatrix.jamPelajaran.map(jp => {
                        const status = student.dates[date]?.[jp];
                        return (
                          <TableCell key={`${date}-${jp}`} className="text-center">
                            <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${getStatusColor(status)}`}>
                              {getStatusSymbol(status)}
                            </div>
                          </TableCell>
                        );
                      })
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbsensiExcelTable;
