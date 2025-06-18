
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, User } from 'lucide-react';

interface JurnalHari {
  id_jurnal: string;
  mata_pelajaran: string;
  nama_guru: string;
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  jam_diklat: number;
}

interface JurnalMengajarTableProps {
  tanggalPilihan: string;
  jurnalHari: JurnalHari[];
}

const JurnalMengajarTable: React.FC<JurnalMengajarTableProps> = ({
  tanggalPilihan,
  jurnalHari
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Jurnal Mengajar Tanggal {new Date(tanggalPilihan).toLocaleDateString('id-ID')}</CardTitle>
      </CardHeader>
      <CardContent>
        {jurnalHari.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program Diklat</TableHead>
                  <TableHead>Nama Guru dan Toolman</TableHead>
                  <TableHead>Pokok Pembahasan</TableHead>
                  <TableHead>Paraf</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jurnalHari.map((jurnal) => (
                  <TableRow key={jurnal.id_jurnal}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{jurnal.mata_pelajaran}</div>
                        <div className="text-sm text-gray-500">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {jurnal.waktu_mulai} - {jurnal.waktu_selesai}
                        </div>
                      </div>
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
