
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SiswaAbsensi {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  status_absensi: Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | null>;
}

interface JurnalHari {
  id_jurnal: string;
  mata_pelajaran: string;
  nama_guru: string;
  jam_pelajaran: number;
  judul_materi: string;
}

interface PresensiTableProps {
  tanggalPilihan: string;
  siswaAbsensi: SiswaAbsensi[];
  jurnalHari: JurnalHari[];
  loading: boolean;
}

const PresensiTable: React.FC<PresensiTableProps> = ({
  tanggalPilihan,
  siswaAbsensi,
  jurnalHari,
  loading
}) => {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Hadir':
        return <Badge variant="default" className="bg-green-500">H</Badge>;
      case 'Izin':
        return <Badge variant="secondary" className="bg-yellow-500">I</Badge>;
      case 'Sakit':
        return <Badge variant="secondary" className="bg-blue-500">S</Badge>;
      case 'Alpha':
        return <Badge variant="destructive">A</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  // Sort jurnal by jam_pelajaran
  const sortedJurnalHari = [...jurnalHari].sort((a, b) => a.jam_pelajaran - b.jam_pelajaran);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presensi Siswa Tanggal {new Date(tanggalPilihan).toLocaleDateString('id-ID')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NISN</TableHead>
                  {sortedJurnalHari.map((jurnal) => (
                    <TableHead key={jurnal.id_jurnal} className="text-center min-w-16">
                      <div className="text-xs">
                        <div>JP {jurnal.jam_pelajaran}</div>
                        <div className="text-gray-500">{jurnal.mata_pelajaran}</div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siswaAbsensi.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4 + sortedJurnalHari.length} className="text-center py-8 text-gray-500">
                      Tidak ada data presensi
                    </TableCell>
                  </TableRow>
                ) : (
                  siswaAbsensi.map((siswa, index) => (
                    <TableRow key={siswa.id_siswa}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{siswa.nama_lengkap}</TableCell>
                      <TableCell>{siswa.nisn}</TableCell>
                      {sortedJurnalHari.map((jurnal) => (
                        <TableCell key={jurnal.id_jurnal} className="text-center">
                          {getStatusBadge(siswa.status_absensi[`jp_${jurnal.jam_pelajaran}`])}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        {/* Calculate daily summary */}
                        {(() => {
                          const statuses = Object.values(siswa.status_absensi);
                          const hadir = statuses.filter(s => s === 'Hadir').length;
                          const total = statuses.filter(s => s !== null).length;
                          return total > 0 ? `${hadir}/${total}` : '-';
                        })()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PresensiTable;
