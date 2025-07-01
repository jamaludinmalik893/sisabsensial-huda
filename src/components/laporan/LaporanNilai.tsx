
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserSession } from '@/types';
import { useLaporanNilai } from '@/hooks/useLaporanNilai';
import { AlertCircle, TrendingUp, Users, Award, Target } from 'lucide-react';
import type { LaporanFilters } from '@/types/laporan';

interface LaporanNilaiProps {
  userSession: UserSession;
  filters: LaporanFilters;
  onSiswaClick?: (siswa: any) => void;
}

const LaporanNilai: React.FC<LaporanNilaiProps> = ({ 
  userSession, 
  filters,
  onSiswaClick 
}) => {
  const { statistikNilai, loading, error } = useLaporanNilai(userSession.guru.id_guru, filters);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPerformanceBadge = (nilai: number) => {
    if (nilai >= 85) return <Badge className="bg-green-500">Sangat Baik</Badge>;
    if (nilai >= 75) return <Badge className="bg-blue-500">Baik</Badge>;
    if (nilai >= 65) return <Badge className="bg-yellow-500">Cukup</Badge>;
    return <Badge className="bg-red-500">Perlu Perhatian</Badge>;
  };

  const handleSiswaClick = (siswa: any) => {
    if (onSiswaClick) {
      const studentData = {
        id_siswa: siswa.nama_siswa,
        nama_lengkap: siswa.nama_siswa,
        nisn: siswa.nisn,
        jenis_kelamin: 'Laki-laki',
        kelas: { nama_kelas: siswa.kelas }
      };
      onSiswaClick(studentData);
    }
  };

  // Calculate overview statistics
  const totalSiswa = statistikNilai.length;
  const rataRataNilai = totalSiswa > 0 
    ? Math.round(statistikNilai.reduce((sum, s) => sum + s.rata_rata_nilai, 0) / totalSiswa * 100) / 100
    : 0;
  const nilaiTertinggi = totalSiswa > 0 
    ? Math.max(...statistikNilai.map(s => s.rata_rata_nilai))
    : 0;
  const siswaBerprestasi = statistikNilai.filter(s => s.rata_rata_nilai >= 85).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data nilai...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{totalSiswa}</div>
            <div className="text-sm text-gray-500">Total Siswa</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{rataRataNilai}</div>
            <div className="text-sm text-gray-500">Rata-rata Nilai</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{nilaiTertinggi}</div>
            <div className="text-sm text-gray-500">Nilai Tertinggi</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">{siswaBerprestasi}</div>
            <div className="text-sm text-gray-500">Siswa Berprestasi</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Nilai Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          {statistikNilai.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data nilai ditemukan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ranking</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Rata-rata</TableHead>
                    <TableHead>Tertinggi</TableHead>
                    <TableHead>Terendah</TableHead>
                    <TableHead>Tugas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistikNilai.map((siswa, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="text-center">
                          <Badge variant={index < 3 ? 'default' : 'outline'}>
                            #{siswa.ranking}
                          </Badge>
                        </div>
                      </TableCell>
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
                        <div className="text-xl font-bold">
                          {siswa.rata_rata_nilai}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-green-600 font-medium">
                          {siswa.nilai_tertinggi}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-red-600 font-medium">
                          {siswa.nilai_terendah}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <span className="text-sm">
                            {siswa.jumlah_tugas} tugas
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPerformanceBadge(siswa.rata_rata_nilai)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanNilai;
