
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User } from 'lucide-react';

interface CatatanAbsensi {
  id_absensi: string;
  siswa_nama: string;
  siswa_nisn: string;
  status: string;
  catatan: string;
  guru_nama: string;
  mata_pelajaran: string;
  waktu_mulai: string;
  waktu_selesai: string;
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
  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-gray-400">-</span>;
    
    const variants = {
      'Hadir': 'bg-green-500',
      'Izin': 'bg-yellow-500', 
      'Sakit': 'bg-blue-500',
      'Alpha': 'bg-red-500'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-500'}>
        {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Catatan Absensi Tanggal {new Date(tanggalPilihan).toLocaleDateString('id-ID')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Memuat catatan...</div>
        ) : catatanAbsensi.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Guru</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catatanAbsensi.map((catatan) => (
                  <TableRow key={catatan.id_absensi}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{catatan.siswa_nama}</div>
                        <div className="text-sm text-gray-500">{catatan.siswa_nisn}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(catatan.status)}
                    </TableCell>
                    <TableCell>{catatan.mata_pelajaran}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {catatan.waktu_mulai} - {catatan.waktu_selesai}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm">{catatan.catatan}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{catatan.guru_nama}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Tidak ada catatan absensi untuk tanggal ini</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CatatanAbsensiTable;
