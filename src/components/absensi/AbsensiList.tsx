
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import StudentAttendanceRow from './StudentAttendanceRow';
import ProfilSiswaPopup from '@/components/ProfilSiswaPopup';

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  foto_url?: string;
}

interface AbsensiData {
  id_siswa: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  catatan?: string;
}

interface AbsensiListProps {
  siswaList: Siswa[];
  absensiData: AbsensiData[];
  loading: boolean;
  onStatusUpdate: (id_siswa: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => void;
  onCatatanUpdate: (id_siswa: string, catatan: string) => void;
  onSaveAbsensi: () => void;
}

const AbsensiList: React.FC<AbsensiListProps> = ({
  siswaList,
  absensiData,
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
    return absensiData.find(item => item.id_siswa === id_siswa);
  };

  return (
    <>
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
                  status={absensiSiswa?.status || 'Hadir'}
                  catatan={absensiSiswa?.catatan || ''}
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
