
import React from 'react';
import { UserSession } from '@/types';
import { useLaporanKehadiran } from '@/hooks/useLaporanData';
import StatistikOverview from './components/StatistikOverview';
import KehadiranCharts from './components/KehadiranCharts';
import SiswaKehadiranTable from './components/SiswaKehadiranTable';

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
}

const LaporanKehadiran: React.FC<LaporanKehadiranProps> = ({ userSession, filters }) => {
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

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Terjadi kesalahan saat memuat data</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistik Overview */}
      <StatistikOverview overview={overview} loading={loading} />

      {/* Grafik */}
      <KehadiranCharts 
        statistikKelas={statistikKelas}
        trendKehadiran={trendKehadiran}
        loading={loading}
      />

      {/* Tabel Detail Siswa */}
      <SiswaKehadiranTable 
        statistikKehadiran={statistikKehadiran} 
        loading={loading}
      />
    </div>
  );
};

export default LaporanKehadiran;
