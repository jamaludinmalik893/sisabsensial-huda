
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
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  jam_diklat: number;
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
        <CardTitle>Presensi Harian Bulan {new Date(tanggalPilihan).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No.</TableHead>
                  <TableHead>Nama</TableHead>
                  {jurnalHari.map((_, index) => (
                    <TableHead key={index} className="text-center min-w-20">
                      Jam Diklat Ke {index + 1}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {siswaAbsensi.map((siswa, index) => (
                  <TableRow key={siswa.id_siswa}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{siswa.nama_lengkap}</div>
                        <div className="text-sm text-gray-500">{siswa.nisn}</div>
                      </div>
                    </TableCell>
                    {jurnalHari.map((_, jamIndex) => (
                      <TableCell key={jamIndex} className="text-center">
                        {getStatusBadge(siswa.status_absensi[`jam_${jamIndex + 1}`])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {!loading && siswaAbsensi.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data siswa untuk tanggal ini
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PresensiTable;
