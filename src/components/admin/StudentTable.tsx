
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit2, Trash2, ArrowUpAZ, ArrowDownAZ } from 'lucide-react';

interface SiswaWithRelations {
  id_siswa: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: 'Laki-laki' | 'Perempuan';
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon?: string;
  nomor_telepon_siswa?: string;
  nama_orang_tua: string;
  nomor_telepon_orang_tua?: string;
  id_kelas: string;
  id_guru_wali: string;
  tahun_masuk: number;
  foto_url?: string;
  created_at?: string;
  updated_at?: string;
  kelas?: { nama_kelas: string };
  guru_wali?: { nama_lengkap: string };
}

interface StudentTableProps {
  siswaList: SiswaWithRelations[];
  onEdit: (siswa: SiswaWithRelations) => void;
  onDelete: (id: string) => void;
  onSiswaClick: (siswa: SiswaWithRelations) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({
  siswaList,
  onEdit,
  onDelete,
  onSiswaClick
}) => {
  const [sortAscending, setSortAscending] = useState(true);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const sortedSiswaList = useMemo(() => {
    return [...siswaList].sort((a, b) => {
      const comparison = a.nama_lengkap.localeCompare(b.nama_lengkap, 'id', { 
        sensitivity: 'base' 
      });
      return sortAscending ? comparison : -comparison;
    });
  }, [siswaList, sortAscending]);

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Siswa ({siswaList.length} siswa)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <span>Nama Siswa</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSort}
                    className="h-6 w-6 p-0"
                  >
                    {sortAscending ? (
                      <ArrowUpAZ className="h-4 w-4" />
                    ) : (
                      <ArrowDownAZ className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>No. Telepon Siswa</TableHead>
              <TableHead>Tahun Masuk</TableHead>
              <TableHead>Guru Wali</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSiswaList.map((siswa) => (
              <TableRow key={siswa.id_siswa}>
                <TableCell>
                  <Avatar 
                    className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onSiswaClick(siswa)}
                  >
                    <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
                    <AvatarFallback>{getInitials(siswa.nama_lengkap)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div 
                    className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => onSiswaClick(siswa)}
                  >
                    {siswa.nama_lengkap}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{siswa.nisn}</div>
                </TableCell>
                <TableCell>
                  {siswa.kelas ? (
                    <Badge variant="outline">{siswa.kelas.nama_kelas}</Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>{siswa.jenis_kelamin}</TableCell>
                <TableCell>
                  {(siswa.nomor_telepon_siswa || siswa.nomor_telepon) ? (
                    <span className="text-sm">{siswa.nomor_telepon_siswa || siswa.nomor_telepon}</span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>{siswa.tahun_masuk}</TableCell>
                <TableCell>
                  {siswa.guru_wali ? siswa.guru_wali.nama_lengkap : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(siswa)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(siswa.id_siswa)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StudentTable;
