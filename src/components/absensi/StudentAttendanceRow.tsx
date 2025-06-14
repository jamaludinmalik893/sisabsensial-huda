
import React from 'react';
import { Button } from '@/components/ui/button';

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
}

interface StudentAttendanceRowProps {
  siswa: Siswa;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  onStatusChange: (id_siswa: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => void;
}

const StudentAttendanceRow: React.FC<StudentAttendanceRowProps> = ({
  siswa,
  status,
  onStatusChange
}) => {
  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'Hadir': return 'bg-green-100 text-green-800';
      case 'Izin': return 'bg-yellow-100 text-yellow-800';
      case 'Sakit': return 'bg-blue-100 text-blue-800';
      case 'Alpha': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <p className="font-medium">{siswa.nama_lengkap}</p>
        <p className="text-sm text-gray-500">NISN: {siswa.nisn}</p>
      </div>
      <div className="flex gap-2">
        {(['Hadir', 'Izin', 'Sakit', 'Alpha'] as const).map((statusOption) => (
          <Button
            key={statusOption}
            variant={status === statusOption ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusChange(siswa.id_siswa, statusOption)}
            className={status === statusOption ? getStatusColor(statusOption) : ''}
          >
            {statusOption}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StudentAttendanceRow;
