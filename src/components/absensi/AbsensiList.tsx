
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import StudentAttendanceRow from './StudentAttendanceRow';

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
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
  onSaveAbsensi: () => void;
}

const AbsensiList: React.FC<AbsensiListProps> = ({
  siswaList,
  absensiData,
  loading,
  onStatusUpdate,
  onSaveAbsensi
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Daftar Siswa ({siswaList.length} siswa)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {siswaList.map((siswa, index) => (
            <StudentAttendanceRow
              key={siswa.id_siswa}
              siswa={siswa}
              status={absensiData[index]?.status || 'Hadir'}
              onStatusChange={onStatusUpdate}
            />
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={onSaveAbsensi} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Absensi'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AbsensiList;
