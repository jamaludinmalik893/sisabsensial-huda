
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Nilai {
  id_nilai: string;
  jenis_nilai: string;
  skor: number;
  tanggal_nilai: string;
  catatan?: string;
  siswa: {
    nama_lengkap: string;
    nisn: string;
  };
  mata_pelajaran: {
    nama_mapel: string;
  };
}

interface NilaiTableProps {
  filteredNilai: Nilai[];
  loading: boolean;
}

const NilaiTable: React.FC<NilaiTableProps> = ({ filteredNilai, loading }) => {
  const getScoreColor = (skor: number) => {
    if (skor >= 85) return 'bg-green-100 text-green-800';
    if (skor >= 75) return 'bg-blue-100 text-blue-800';
    if (skor >= 65) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Nilai</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Skor</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNilai.map((nilai) => (
                <TableRow key={nilai.id_nilai}>
                  <TableCell>
                    {new Date(nilai.tanggal_nilai).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{nilai.siswa.nama_lengkap}</div>
                      <div className="text-sm text-gray-500">{nilai.siswa.nisn}</div>
                    </div>
                  </TableCell>
                  <TableCell>{nilai.mata_pelajaran.nama_mapel}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{nilai.jenis_nilai}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getScoreColor(nilai.skor)}>
                      {nilai.skor}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {nilai.catatan || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {!loading && filteredNilai.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Belum ada data nilai sesuai filter
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NilaiTable;
