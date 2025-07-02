
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface CatatanAbsensi {
  id_absensi: string;
  siswa_nama: string;
  siswa_nisn: string;
  status: string;
  catatan: string;
  guru_nama: string;
  mata_pelajaran: string;
  jam_pelajaran: number;
}

interface CatatanAbsensiTableProps {
  tanggalPilihan: string;
  catatanAbsensi: CatatanAbsensi[];
  loading: boolean;
}

const CatatanAbsensiTable: React.FC<CatatanAbsensiTableProps> = ({
  tanggalPilihan,
  catatanAbsensi,
  loading
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Hadir':
        return <Badge variant="default" className="bg-green-500">Hadir</Badge>;
      case 'Izin':
        return <Badge variant="secondary" className="bg-yellow-500">Izin</Badge>;
      case 'Sakit':
        return <Badge variant="secondary" className="bg-blue-500">Sakit</Badge>;
      case 'Alpha':
        return <Badge variant="destructive">Alpha</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Sort by jam_pelajaran and then by siswa_nama
  const sortedCatatan = [...catatanAbsensi].sort((a, b) => {
    if (a.jam_pelajaran !== b.jam_pelajaran) {
      return a.jam_pelajaran - b.jam_pelajaran;
    }
    return a.siswa_nama.localeCompare(b.siswa_nama);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catatan Absensi Tanggal {new Date(tanggalPilihan).toLocaleDateString('id-ID')}</CardTitle>
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
                  <TableHead className="w-24">JP</TableHead>
                  <TableHead>Nama Siswa</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Guru</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCatatan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Tidak ada catatan absensi
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCatatan.map((catatan, index) => (
                    <TableRow key={catatan.id_absensi}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="text-center font-mono">
                        {catatan.jam_pelajaran}
                      </TableCell>
                      <TableCell className="font-medium">{catatan.siswa_nama}</TableCell>
                      <TableCell>{catatan.siswa_nisn}</TableCell>
                      <TableCell>{catatan.mata_pelajaran}</TableCell>
                      <TableCell>{catatan.guru_nama}</TableCell>
                      <TableCell>{getStatusBadge(catatan.status)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={catatan.catatan}>
                          {catatan.catatan}
                        </div>
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

export default CatatanAbsensiTable;
