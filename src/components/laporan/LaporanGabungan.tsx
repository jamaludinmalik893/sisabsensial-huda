
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { UserSession } from '@/types';
import { useLaporanKehadiran } from '@/hooks/useLaporanKehadiran';
import { useLaporanNilai } from '@/hooks/useLaporanNilai';
import { AlertCircle, Users, TrendingUp, Award, GraduationCap } from 'lucide-react';
import type { LaporanFilters } from '@/types/laporan';

interface LaporanGabunganProps {
  userSession: UserSession;
  filters: LaporanFilters;
  onSiswaClick?: (siswa: any) => void;
}

const LaporanGabungan: React.FC<LaporanGabunganProps> = ({ 
  userSession, 
  filters,
  onSiswaClick 
}) => {
  const { statistikKehadiran, loading: loadingKehadiran, error: errorKehadiran } = 
    useLaporanKehadiran(userSession.guru.id_guru, filters);
  const { statistikNilai, loading: loadingNilai, error: errorNilai } = 
    useLaporanNilai(userSession.guru.id_guru, filters);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOverallPerformanceBadge = (kehadiran: number, nilai: number) => {
    if (kehadiran >= 90 && nilai >= 85) return <Badge className="bg-green-500">Sangat Baik</Badge>;
    if (kehadiran >= 80 && nilai >= 75) return <Badge className="bg-blue-500">Baik</Badge>;
    if (kehadiran >= 70 && nilai >= 65) return <Badge className="bg-yellow-500">Cukup</Badge>;
    return <Badge className="bg-red-500">Perlu Perhatian</Badge>;
  };

  const handleSiswaClick = (siswa: any) => {
    if (onSiswaClick) {
      const studentData = {
        id_siswa: siswa.nama_siswa,
        nama_lengkap: siswa.nama_siswa,
        nisn: siswa.nisn || siswa.nama_siswa,
        jenis_kelamin: 'Laki-laki',
        kelas: { nama_kelas: siswa.kelas }
      };
      onSiswaClick(studentData);
    }
  };

  // Combine attendance and grade data
  const combinedData = statistikKehadiran.map(kehadiran => {
    const nilai = statistikNilai.find(n => n.nama_siswa === kehadiran.nama_siswa);
    return {
      ...kehadiran,
      rata_rata_nilai: nilai?.rata_rata_nilai || 0,
      jumlah_tugas: nilai?.jumlah_tugas || 0,
      nilai_tertinggi: nilai?.nilai_tertinggi || 0,
      nilai_terendah: nilai?.nilai_terendah || 0
    };
  });

  // Calculate overview statistics
  const totalSiswa = combinedData.length;
  const rataKehadiran = totalSiswa > 0 
    ? Math.round(combinedData.reduce((sum, s) => sum + s.persentase_hadir, 0) / totalSiswa)
    : 0;
  const rataNilai = totalSiswa > 0 
    ? Math.round(combinedData.reduce((sum, s) => sum + s.rata_rata_nilai, 0) / totalSiswa * 100) / 100
    : 0;
  const siswaPerluPerhatian = combinedData.filter(s => 
    s.persentase_hadir < 80 || s.rata_rata_nilai < 65
  ).length;

  const loading = loadingKehadiran || loadingNilai;
  const error = errorKehadiran || errorNilai;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data gabungan...</p>
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
            <div className="text-2xl font-bold">{rataKehadiran}%</div>
            <div className="text-sm text-gray-500">Rata Kehadiran</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{rataNilai}</div>
            <div className="text-sm text-gray-500">Rata Nilai</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <GraduationCap className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold">{siswaPerluPerhatian}</div>
            <div className="text-sm text-gray-500">Perlu Perhatian</div>
          </CardContent>
        </Card>
      </div>

      {/* Combined Table */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Gabungan Kehadiran & Nilai</CardTitle>
        </CardHeader>
        <CardContent>
          {combinedData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data ditemukan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Kehadiran</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead>Status Keseluruhan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedData.map((siswa, index) => (
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="text-xl font-bold">
                            {siswa.rata_rata_nilai > 0 ? siswa.rata_rata_nilai : '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {siswa.jumlah_tugas} tugas
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getOverallPerformanceBadge(siswa.persentase_hadir, siswa.rata_rata_nilai)}
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

export default LaporanGabungan;
