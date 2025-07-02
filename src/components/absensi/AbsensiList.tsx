
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, UserCheck, UserX, AlertTriangle, Heart } from 'lucide-react';
import StudentAttendanceRow from './StudentAttendanceRow';
import ProfilSiswaPopup from '@/components/ProfilSiswaPopup';

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  foto_url?: string;
}

interface AbsensiListProps {
  siswaList: Siswa[];
  absensiData: { [key: string]: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' };
  absensiCatatan: { [key: string]: string };
  loading: boolean;
  onStatusUpdate: (id_siswa: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => void;
  onCatatanUpdate: (id_siswa: string, catatan: string) => void;
  onSaveAbsensi: () => void;
}

const AbsensiList: React.FC<AbsensiListProps> = ({
  siswaList,
  absensiData,
  absensiCatatan,
  loading,
  onStatusUpdate,
  onCatatanUpdate,
  onSaveAbsensi
}) => {
  const [selectedSiswa, setSelectedSiswa] = useState<any>(null);
  const [isProfilOpen, setIsProfilOpen] = useState(false);

  const handleSiswaClick = (siswa: Siswa) => {
    // Transform siswa data to match ProfilSiswaPopup expected format
    const siswaWithDetails = {
      ...siswa,
      jenis_kelamin: 'Laki-laki' as const, // Default value, will be loaded from API
      tanggal_lahir: '',
      tempat_lahir: '',
      alamat: '',
      nomor_telepon: '',
      nama_orang_tua: '',
      nomor_telepon_orang_tua: '',
      id_kelas: '',
      id_guru_wali: '',
      tahun_masuk: new Date().getFullYear(),
      kelas: null,
      guru_wali: null
    };
    setSelectedSiswa(siswaWithDetails);
    setIsProfilOpen(true);
  };

  const getAbsensiForSiswa = (id_siswa: string) => {
    return {
      status: absensiData[id_siswa] || 'Hadir',
      catatan: absensiCatatan[id_siswa] || ''
    };
  };

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const stats = {
      total: siswaList.length,
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0
    };

    Object.values(absensiData).forEach(status => {
      switch (status) {
        case 'Hadir':
          stats.hadir++;
          break;
        case 'Izin':
          stats.izin++;
          break;
        case 'Sakit':
          stats.sakit++;
          break;
        case 'Alpha':
          stats.alpha++;
          break;
      }
    });

    return stats;
  }, [siswaList, absensiData]);

  const attendancePercentage = attendanceStats.total > 0 
    ? Math.round((attendanceStats.hadir / attendanceStats.total) * 100) 
    : 0;

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-2xl font-bold">{attendanceStats.total}</div>
            <div className="text-sm text-gray-500">Total Siswa</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{attendanceStats.hadir}</div>
            <div className="text-sm text-gray-500">Hadir</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{attendanceStats.izin}</div>
            <div className="text-sm text-gray-500">Izin</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{attendanceStats.sakit}</div>
            <div className="text-sm text-gray-500">Sakit</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{attendanceStats.alpha}</div>
            <div className="text-sm text-gray-500">Alpha</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Percentage */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Tingkat Kehadiran</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{attendancePercentage}%</div>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Daftar Siswa ({siswaList.length} siswa)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {siswaList.map((siswa) => {
              const absensiSiswa = getAbsensiForSiswa(siswa.id_siswa);
              return (
                <StudentAttendanceRow
                  key={siswa.id_siswa}
                  siswa={siswa}
                  status={absensiSiswa.status}
                  catatan={absensiSiswa.catatan}
                  onStatusChange={onStatusUpdate}
                  onCatatanChange={onCatatanUpdate}
                  onSiswaClick={handleSiswaClick}
                />
              );
            })}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={onSaveAbsensi} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Absensi'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfilSiswaPopup
        siswa={selectedSiswa}
        isOpen={isProfilOpen}
        onClose={() => {
          setIsProfilOpen(false);
          setSelectedSiswa(null);
        }}
      />
    </>
  );
};

export default AbsensiList;
