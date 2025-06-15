
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCheck
} from 'lucide-react';
import { StatistikDashboard, UserSession } from '@/types';
import StatistikNilaiChart from "./dashboard/StatistikNilaiChart";
import StatistikAbsensiChart from "./dashboard/StatistikAbsensiChart";
import { supabase } from '@/integrations/supabase/client';

interface DashboardProps {
  userSession: UserSession;
}

const Dashboard: React.FC<DashboardProps> = ({ userSession }) => {
  const [statistik, setStatistik] = useState<StatistikDashboard>({
    total_siswa: 0,
    total_guru: 0,
    total_kelas: 0,
    kehadiran_hari_ini: {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0
    },
    jurnal_hari_ini: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistik = async () => {
      setLoading(true);
      // 1. Total siswa
      const { count: siswaCount } = await supabase
        .from('siswa')
        .select('id_siswa', { count: 'exact', head: true });
      // 2. Total guru
      const { count: guruCount } = await supabase
        .from('guru')
        .select('id_guru', { count: 'exact', head: true });
      // 3. Total kelas
      const { count: kelasCount } = await supabase
        .from('kelas')
        .select('id_kelas', { count: 'exact', head: true });

      // 4. Statistik Kehadiran Hari Ini (tanggal lokal)
      const today = new Date();
      today.setHours(0,0,0,0);
      const tanggalStr = today.toISOString().slice(0, 10);

      // Cek jurnal_harian hari ini
      const { data: jurnalHariIni, error: jurnalError } = await supabase
        .from('jurnal_harian')
        .select('id_jurnal')
        .eq('tanggal_pelajaran', tanggalStr);

      // Ambil data absensi untuk jurnal/jadwal hari ini
      let hadir = 0, izin = 0, sakit = 0, alpha = 0;
      if (jurnalHariIni && jurnalHariIni.length > 0) {
        const jurnalIdList = jurnalHariIni.map(j => j.id_jurnal);
        const { data: absensiData } = await supabase
          .from('absensi')
          .select('status')
          .in('id_jurnal', jurnalIdList);

        // Hitung agregat kehadiran
        absensiData?.forEach(row => {
          if (row.status === 'Hadir') hadir++;
          else if (row.status === 'Izin') izin++;
          else if (row.status === 'Sakit') sakit++;
          else if (row.status === 'Alpha') alpha++;
        });
      }

      setStatistik({
        total_siswa: siswaCount || 0,
        total_guru: guruCount || 0,
        total_kelas: kelasCount || 0,
        kehadiran_hari_ini: {
          hadir,
          izin,
          sakit,
          alpha
        },
        jurnal_hari_ini: jurnalHariIni ? jurnalHariIni.length : 0,
      });
      setLoading(false);
    };

    fetchStatistik();
  }, []);

  const totalKehadiran = Object.values(statistik.kehadiran_hari_ini).reduce((a, b) => a + b, 0);
  const persentaseKehadiran = totalKehadiran > 0 ? (statistik.kehadiran_hari_ini.hadir / totalKehadiran) * 100 : 0;

  const aktivitasTerbaru = [
    {
      id: 1,
      aksi: "Absensi kelas X RPL 1",
      waktu: "10 menit lalu",
      guru: "Sri Mulyati, S.Kom",
      status: "completed"
    },
    {
      id: 2,
      aksi: "Input nilai Matematika",
      waktu: "25 menit lalu", 
      guru: "Ahmad Wijaya, M.Pd",
      status: "completed"
    },
    {
      id: 3,
      aksi: "Jurnal harian dibuat",
      waktu: "1 jam lalu",
      guru: "Bambang Sutrisno, S.T",
      status: "completed"
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Dashboard */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Selamat Datang, {userSession.guru.nama_lengkap}
        </h1>
        <p className="text-gray-600">
          Dashboard Sistem Informasi Absensi & Nilai SMK AL-HUDA
        </p>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Siswa</p>
              {loading ? (
                <div className="animate-pulse h-8 w-20 bg-gray-200 rounded mb-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{statistik.total_siswa}</p>
              )}
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                Aktif pembelajaran
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Kelas</p>
              {loading ? (
                <div className="animate-pulse h-8 w-12 bg-gray-200 rounded mb-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{statistik.total_kelas}</p>
              )}
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <BookOpen className="h-3 w-3 mr-1" />
                Kelas aktif
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kehadiran Hari Ini</p>
              {loading ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mb-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{persentaseKehadiran.toFixed(1)}%</p>
              )}
              <p className="text-xs text-green-600 flex items-center mt-1">
                <UserCheck className="h-3 w-3 mr-1" />
                {statistik.kehadiran_hari_ini.hadir} dari {totalKehadiran} siswa
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jurnal Hari Ini</p>
              {loading ? (
                <div className="animate-pulse h-8 w-10 bg-gray-200 rounded mb-2" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{statistik.jurnal_hari_ini}</p>
              )}
              <p className="text-xs text-purple-600 flex items-center mt-1">
                <BookOpen className="h-3 w-3 mr-1" />
                Jurnal dibuat
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Statistik Grafik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatistikNilaiChart />
        <StatistikAbsensiChart />
      </div>

      {/* Info Siswa Terbaik & Motivasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Siswa Terbaik */}
        <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-white rounded-lg p-6 shadow overflow-hidden flex items-center">
          <img
            src="/placeholder.svg"
            alt="Siswa Terbaik"
            className="w-16 h-16 rounded-full border-2 border-blue-400 mr-4"
          />
          <div>
            <p className="text-lg font-semibold text-gray-800">Siswa Terbaik Bulan Ini</p>
            <p className="text-blue-600 font-bold">Ahmad Rizki Pratama</p>
            <p className="text-gray-600 text-sm">Nilai Rata-rata: <span className="font-medium">91</span></p>
          </div>
        </div>
        {/* Panel Motivasi/Filler */}
        <div className="bg-gradient-to-r from-emerald-100 via-green-50 to-white rounded-lg p-6 shadow flex flex-col justify-center items-center text-center">
          <p className="text-2xl md:text-3xl font-bold text-emerald-700 mb-2">🌟</p>
          <p className="text-md font-semibold text-gray-800 mb-1">Motivasi Hari Ini</p>
          <p className="text-gray-600 text-sm italic">"Pendidikan adalah senjata paling ampuh untuk mengubah dunia." <br /> <span className="text-xs text-right block mt-1">- Nelson Mandela</span></p>
        </div>
      </div>

      {/* Detail Kehadiran & Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detail Kehadiran */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detail Kehadiran Hari Ini</h3>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {totalKehadiran} Total
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Progress Bar Kehadiran */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tingkat Kehadiran</span>
                  <span className="font-medium">{persentaseKehadiran.toFixed(1)}%</span>
                </div>
                <Progress value={persentaseKehadiran} className="h-2" />
              </div>

              {/* Breakdown Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Hadir</p>
                    <p className="font-semibold text-green-700">{statistik.kehadiran_hari_ini.hadir}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Izin</p>
                    <p className="font-semibold text-yellow-700">{statistik.kehadiran_hari_ini.izin}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Sakit</p>
                    <p className="font-semibold text-blue-700">{statistik.kehadiran_hari_ini.sakit}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Alpha</p>
                    <p className="font-semibold text-red-700">{statistik.kehadiran_hari_ini.alpha}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Aktivitas Terbaru */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h3>
              <Badge variant="outline">Real-time</Badge>
            </div>

            <div className="space-y-4">
              {aktivitasTerbaru.map((aktivitas) => (
                <div key={aktivitas.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{aktivitas.aksi}</p>
                    <p className="text-sm text-gray-600">{aktivitas.guru}</p>
                    <p className="text-xs text-gray-500">{aktivitas.waktu}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <button className="text-sm text-primary hover:text-primary-700 font-medium">
                Lihat semua aktivitas →
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Info Sekolah */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-start space-x-4">
          <div className="bg-primary text-white p-3 rounded-full">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Informasi Sekolah
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-medium">SMK AL-HUDA</p>
                <p>Teknologi Rekayasa Perangkat Lunak</p>
                <p>Teknik Komputer dan Jaringan</p>
              </div>
              <div>
                <p className="font-medium">Lokasi</p>
                <p>Kota Kediri, Jawa Timur</p>
                <p>Terakreditasi A</p>
              </div>
              <div>
                <p className="font-medium">Kontak</p>
                <p>admin@smkalhuda.sch.id</p>
                <p>(0354) 123456</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
