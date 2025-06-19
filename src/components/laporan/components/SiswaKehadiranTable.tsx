import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import type { StatistikKehadiran } from '@/types/laporan';

interface SiswaKehadiranTableProps {
  data: StatistikKehadiran[];
  onSiswaClick?: (siswa: any) => void;
}

const SiswaKehadiranTable: React.FC<SiswaKehadiranTableProps> = ({ data, onSiswaClick }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-green-500">Sangat Baik</Badge>;
    if (percentage >= 80) return <Badge className="bg-blue-500">Baik</Badge>;
    if (percentage >= 70) return <Badge className="bg-yellow-500">Cukup</Badge>;
    return <Badge className="bg-red-500">Perlu Perhatian</Badge>;
  };

  const handleSiswaClick = (siswa: StatistikKehadiran) => {
    if (onSiswaClick) {
      // Create a student object that matches the expected format
      const studentData = {
        id_siswa: siswa.nama_siswa, // Using nama_siswa as fallback since we don't have id_siswa
        nama_lengkap: siswa.nama_siswa,
        nisn: siswa.nisn,
        jenis_kelamin: 'Laki-laki', // Default value since not available in StatistikKehadiran
        kelas: { nama_kelas: siswa.kelas }
      };
      onSiswaClick(studentData);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Siswa</TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Kehadiran</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((siswa, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar 
                    className="cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                    onClick={() => handleSiswaClick(siswa)}
                  >
                    <AvatarImage src="" alt={siswa.nama_siswa} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(siswa.nama_siswa)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <button
                      onClick={() => handleSiswaClick(siswa)}
                      className="font-medium hover:text-blue-600 hover:underline cursor-pointer text-left"
                    >
                      {siswa.nama_siswa}
                    </button>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{siswa.kelas}</Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{siswa.persentase_hadir}%</span>
                    <span className="text-gray-500 text-xs">
                      {siswa.total_hadir}/{siswa.total_pertemuan}
                    </span>
                  </div>
                  <Progress value={siswa.persentase_hadir} className="h-1.5" />
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">H:{siswa.total_hadir}</span>
                    <span className="text-yellow-600">I:{siswa.total_izin}</span>
                    <span className="text-blue-600">S:{siswa.total_sakit}</span>
                    <span className="text-red-600">A:{siswa.total_alpha}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getPerformanceBadge(siswa.persentase_hadir)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SiswaKehadiranTable;
