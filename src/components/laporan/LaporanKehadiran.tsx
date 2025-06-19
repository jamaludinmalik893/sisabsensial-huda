import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSession } from '@/types';
import { useLaporanKehadiran } from '@/hooks/useLaporanKehadiran';
import StatistikOverview from './components/StatistikOverview';
import SiswaKehadiranTable from './components/SiswaKehadiranTable';
import KehadiranCharts from './components/KehadiranCharts';
import { AlertCircle } from 'lucide-react';

interface LaporanKehadiranProps {
  userSession: UserSession;
  filters: {
    periode: string;
    tanggalMulai: string;
    tanggalAkhir: string;
    kelas: string;
    mapel: string;
    siswa: string;
  };
  onSiswaClick?: (siswa: any) => void;
}

const LaporanKehadiran: React.FC<LaporanKehadiranProps> = ({ 
  userSession, 
  filters,
  onSiswaClick 
}) => {
  const {
    statistikKehadiran,
    statistikKelas,
    trendKehadiran,
    overview,
    loading,
    error
  } = useLaporanKehadiran(userSession.guru.id_guru, {
    tanggalMulai: filters.tanggalMulai,
    tanggalAkhir: filters.tanggalAkhir,
    kelas: filters.kelas,
    mapel: filters.mapel
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat data kehadiran...</p>
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
      <StatistikOverview overview={overview} />

      {/* Charts */}
      <KehadiranCharts 
        statistikKelas={statistikKelas}
        trendKehadiran={trendKehadiran}
      />

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Kehadiran Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          {statistikKehadiran.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data kehadiran ditemukan
            </div>
          ) : (
            <SiswaKehadiranTable 
              data={statistikKehadiran} 
              onSiswaClick={onSiswaClick}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanKehadiran;
