
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { UserSession } from '@/types';
import { Star, TrendingUp, Calendar, BookOpen, Award, Users } from 'lucide-react';
import ExportButtons from '../ExportButtons';

interface LaporanGabunganProps {
  userSession: UserSession;
  filters: {
    periode: string;
    tanggalMulai: string;
    tanggalAkhir: string;
    kelas: string;
    mapel: string;
    siswa: string;
  };
}

interface KartuSiswa {
  id_siswa: string;
  nama_siswa: string;
  nisn: string;
  kelas: string;
  foto_url?: string;
  kehadiran: {
    persentase: number;
    hadir: number;
    total: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
  };
  nilai: {
    rata_rata: number;
    tertinggi: number;
    terendah: number;
    grade: string;
    ranking: number;
  };
  tugas: {
    selesai: number;
    total: number;
    persentase: number;
  };
  skor_gabungan: number;
}

const LaporanGabungan: React.FC<LaporanGabunganProps> = ({ userSession, filters }) => {
  const [kartuSiswa, setKartuSiswa] = useState<KartuSiswa[]>([]);

  // Data dummy untuk contoh
  const dummyData: KartuSiswa[] = [
    {
      id_siswa: "1",
      nama_siswa: "Siti Nurhaliza",
      nisn: "1234567891",
      kelas: "X RPL 1",
      foto_url: "",
      kehadiran: {
        persentase: 96,
        hadir: 48,
        total: 50,
        status: 'excellent'
      },
      nilai: {
        rata_rata: 92.3,
        tertinggi: 98,
        terendah: 85,
        grade: 'A',
        ranking: 1
      },
      tugas: {
        selesai: 20,
        total: 20,
        persentase: 100
      },
      skor_gabungan: 96.1
    },
    {
      id_siswa: "2",
      nama_siswa: "Ahmad Rizki",
      nisn: "1234567890",
      kelas: "X RPL 1",
      foto_url: "",
      kehadiran: {
        persentase: 90,
        hadir: 45,
        total: 50,
        status: 'excellent'
      },
      nilai: {
        rata_rata: 88.5,
        tertinggi: 95,
        terendah: 80,
        grade: 'B',
        ranking: 3
      },
      tugas: {
        selesai: 18,
        total: 20,
        persentase: 90
      },
      skor_gabungan: 89.5
    },
    {
      id_siswa: "3",
      nama_siswa: "Budi Santoso",
      nisn: "1234567892",
      kelas: "X RPL 1",
      foto_url: "",
      kehadiran: {
        persentase: 84,
        hadir: 42,
        total: 50,
        status: 'good'
      },
      nilai: {
        rata_rata: 85.7,
        tertinggi: 92,
        terendah: 75,
        grade: 'B',
        ranking: 5
      },
      tugas: {
        selesai: 17,
        total: 20,
        persentase: 85
      },
      skor_gabungan: 84.9
    }
  ];

  useEffect(() => {
    setKartuSiswa(dummyData);
  }, [filters]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getKehadiranColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSkorColor = (skor: number) => {
    if (skor >= 90) return 'text-green-600';
    if (skor >= 80) return 'text-blue-600';
    if (skor >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankingIcon = (ranking: number) => {
    if (ranking === 1) return '🥇';
    if (ranking === 2) return '🥈';
    if (ranking === 3) return '🥉';
    return `#${ranking}`;
  };

  // Prepare export data
  const exportData = kartuSiswa.map((siswa, index) => ({
    'No': index + 1,
    'Nama Siswa': siswa.nama_siswa,
    'NISN': siswa.nisn,
    'Kelas': siswa.kelas,
    'Kehadiran (%)': siswa.kehadiran.persentase,
    'Rata-rata Nilai': siswa.nilai.rata_rata,
    'Grade': siswa.nilai.grade,
    'Ranking': siswa.nilai.ranking,
    'Tugas Selesai (%)': siswa.tugas.persentase,
    'Skor Gabungan': siswa.skor_gabungan
  }));

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa Aktif</p>
                <p className="text-2xl font-bold text-gray-900">150</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Skor Gabungan Rata-rata</p>
                <p className="text-2xl font-bold text-yellow-600">87.2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Siswa Berprestasi</p>
                <p className="text-2xl font-bold text-green-600">32</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header dengan tombol export */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Dashboard Siswa (Kehadiran + Nilai + Tugas)</CardTitle>
            <ExportButtons 
              data={exportData}
              fileName={`laporan-gabungan-${new Date().toISOString().split('T')[0]}`}
              columns={Object.keys(exportData[0] || {})}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Kartu Siswa Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kartuSiswa
          .sort((a, b) => b.skor_gabungan - a.skor_gabungan)
          .map((siswa, index) => (
          <Card key={siswa.id_siswa} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={siswa.foto_url} alt={siswa.nama_siswa} />
                  <AvatarFallback>{getInitials(siswa.nama_siswa)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{siswa.nama_siswa}</h3>
                  <p className="text-sm text-gray-500">{siswa.nisn}</p>
                  <p className="text-sm text-gray-500">{siswa.kelas}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-medium">Ranking</span>
                    <span className="text-lg">{getRankingIcon(siswa.nilai.ranking)}</span>
                  </div>
                  <div className={`text-2xl font-bold ${getSkorColor(siswa.skor_gabungan)}`}>
                    {siswa.skor_gabungan}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Kehadiran */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Kehadiran</span>
                  </div>
                  <Badge className={getKehadiranColor(siswa.kehadiran.status)}>
                    {siswa.kehadiran.persentase}%
                  </Badge>
                </div>
                <Progress value={siswa.kehadiran.persentase} className="h-2" />
                <p className="text-xs text-gray-500">
                  {siswa.kehadiran.hadir}/{siswa.kehadiran.total} pertemuan
                </p>
              </div>

              {/* Nilai */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Nilai</span>
                  </div>
                  <Badge variant={siswa.nilai.grade === 'A' ? 'default' : 'secondary'}>
                    Grade {siswa.nilai.grade}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rata-rata: <span className="font-semibold">{siswa.nilai.rata_rata}</span></span>
                  <span className="text-gray-500">
                    {siswa.nilai.terendah} - {siswa.nilai.tertinggi}
                  </span>
                </div>
                <Progress value={siswa.nilai.rata_rata} className="h-2" />
              </div>

              {/* Tugas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Tugas</span>
                  </div>
                  <Badge variant="outline">
                    {siswa.tugas.persentase}%
                  </Badge>
                </div>
                <Progress value={siswa.tugas.persentase} className="h-2" />
                <p className="text-xs text-gray-500">
                  {siswa.tugas.selesai}/{siswa.tugas.total} tugas selesai
                </p>
              </div>

              {/* Skor Gabungan */}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Skor Gabungan</span>
                  <div className={`text-xl font-bold ${getSkorColor(siswa.skor_gabungan)}`}>
                    {siswa.skor_gabungan}/100
                  </div>
                </div>
                <Progress value={siswa.skor_gabungan} className="h-3 mt-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Kelas (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kartuSiswa
              .sort((a, b) => b.skor_gabungan - a.skor_gabungan)
              .slice(0, 10)
              .map((siswa, index) => (
              <div key={siswa.id_siswa} className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 font-bold">
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={siswa.foto_url} alt={siswa.nama_siswa} />
                  <AvatarFallback>{getInitials(siswa.nama_siswa)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{siswa.nama_siswa}</h4>
                  <p className="text-sm text-gray-500">{siswa.kelas}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className={`text-lg font-bold ${getSkorColor(siswa.skor_gabungan)}`}>
                    {siswa.skor_gabungan}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">K:{siswa.kehadiran.persentase}%</span>
                    <span className="text-blue-600">N:{siswa.nilai.rata_rata}</span>
                    <span className="text-purple-600">T:{siswa.tugas.persentase}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanGabungan;
