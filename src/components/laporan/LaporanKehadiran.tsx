
import React, { useState, useEffect } from 'react';
import { UserSession } from '@/types';
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

interface StatistikKehadiran {
  nama_siswa: string;
  nisn: string;
  kelas: string;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alpha: number;
  total_pertemuan: number;
  persentase_hadir: number;
}

const LaporanKehadiran: React.FC<LaporanKehadiranProps> = ({ userSession, filters }) => {
  const [statistikKehadiran, setStatistikKehadiran] = useState<StatistikKehadiran[]>([]);
  const [loading, setLoading] = useState(false);

  // Data dummy untuk contoh
  const dummyData: StatistikKehadiran[] = [
    {
      nama_siswa: "Ahmad Rizki",
      nisn: "1234567890",
      kelas: "X RPL 1",
      total_hadir: 45,
      total_izin: 3,
      total_sakit: 2,
      total_alpha: 0,
      total_pertemuan: 50,
      persentase_hadir: 90
    },
    {
      nama_siswa: "Siti Nurhaliza",
      nisn: "1234567891",
      kelas: "X RPL 1",
      total_hadir: 48,
      total_izin: 1,
      total_sakit: 1,
      total_alpha: 0,
      total_pertemuan: 50,
      persentase_hadir: 96
    },
    {
      nama_siswa: "Budi Santoso",
      nisn: "1234567892",
      kelas: "X RPL 1",
      total_hadir: 42,
      total_izin: 2,
      total_sakit: 3,
      total_alpha: 3,
      total_pertemuan: 50,
      persentase_hadir: 84
    }
  ];

  useEffect(() => {
    setStatistikKehadiran(dummyData);
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Statistik Overview */}
      <StatistikOverview />

      {/* Grafik */}
      <KehadiranCharts />

      {/* Tabel Detail Siswa */}
      <SiswaKehadiranTable statistikKehadiran={statistikKehadiran} />
    </div>
  );
};

export default LaporanKehadiran;
