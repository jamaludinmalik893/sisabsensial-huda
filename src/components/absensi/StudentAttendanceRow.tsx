
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  foto_url?: string;
}

interface StudentAttendanceRowProps {
  siswa: Siswa;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  onStatusChange: (id_siswa: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => void;
  onSiswaClick?: (siswa: Siswa) => void;
}

const StudentAttendanceRow: React.FC<StudentAttendanceRowProps> = ({
  siswa,
  status,
  onStatusChange,
  onSiswaClick
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hadir': return 'text-green-600';
      case 'Izin': return 'text-yellow-600';
      case 'Sakit': return 'text-blue-600';
      case 'Alpha': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleSiswaClick = () => {
    if (onSiswaClick) {
      onSiswaClick(siswa);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <Avatar 
          className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleSiswaClick}
        >
          <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
          <AvatarFallback>{getInitials(siswa.nama_lengkap)}</AvatarFallback>
        </Avatar>
        <div>
          <p 
            className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleSiswaClick}
          >
            {siswa.nama_lengkap}
          </p>
          <p className="text-sm text-gray-500">NISN: {siswa.nisn}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`text-sm font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
        <Select value={status} onValueChange={(value) => onStatusChange(siswa.id_siswa, value as 'Hadir' | 'Izin' | 'Sakit' | 'Alpha')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hadir">Hadir</SelectItem>
            <SelectItem value="Izin">Izin</SelectItem>
            <SelectItem value="Sakit">Sakit</SelectItem>
            <SelectItem value="Alpha">Alpha</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StudentAttendanceRow;
