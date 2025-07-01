
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User } from 'lucide-react';

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
  // Sort jurnal by jam_pelajaran
  const sortedJurnalHari = [...jurnalHari].sort((a, b) => a.jam_pelajaran - b.jam_pelajaran);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jurnal Mengajar Tanggal {new Date(tanggalPilihan).toLocaleDateString('id-ID')}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedJurnalHari.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>JP</TableHead>
                  <TableHead>Program Diklat</TableHead>
                  <TableHead>Nama Guru dan Toolman</TableHead>
                  <TableHead>Pokok Pembahasan</TableHead>
                  <TableHead>Paraf</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJurnalHari.map((jurnal) => (
                  <TableRow key={jurnal.id_jurnal}>
                    <TableCell>
                      <div className="font-bold text-center">
                        {jurnal.jam_pelajaran}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{jurnal.mata_pelajaran}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {jurnal.nama_guru}
                      </div>
                    </TableCell>
                    <TableCell>{jurnal.judul_materi}</TableCell>
                    <TableCell>
                      <div className="w-16 h-8 border border-gray-300 rounded"></div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Tidak ada jurnal untuk tanggal ini
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JurnalMengajarTable;
