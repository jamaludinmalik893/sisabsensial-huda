
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface JurnalHari {
  id_jurnal: string;
  mata_pelajaran: string;
  nama_guru: string;
  jam_pelajaran: number;
  judul_materi: string;
}

interface JurnalMengajarTableProps {
  tanggalPilihan: string;
  jurnalHari: JurnalHari[];
}

const JurnalMengajarTable: React.FC<JurnalMengajarTableProps> = ({
  tanggalPilihan,
  jurnalHari
}) => {
  // Sort by jam_pelajaran
  const sortedJurnal = [...jurnalHari].sort((a, b) => a.jam_pelajaran - b.jam_pelajaran);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jurnal Mengajar Tanggal {new Date(tanggalPilihan).toLocaleDateString('id-ID')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead className="w-24">Jam Pelajaran</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Guru</TableHead>
                <TableHead>Judul Materi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedJurnal.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Tidak ada jurnal mengajar
                  </TableCell>
                </TableRow>
              ) : (
                sortedJurnal.map((jurnal, index) => (
                  <TableRow key={jurnal.id_jurnal}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="text-center font-mono">
                      JP {jurnal.jam_pelajaran}
                    </TableCell>
                    <TableCell className="font-medium">{jurnal.mata_pelajaran}</TableCell>
                    <TableCell>{jurnal.nama_guru}</TableCell>
                    <TableCell>{jurnal.judul_materi}</TableCell>
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

export default JurnalMengajarTable;
