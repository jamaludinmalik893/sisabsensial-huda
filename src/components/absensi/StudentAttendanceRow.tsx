
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  foto_url?: string;
}

interface StudentAttendanceRowProps {
  siswa: Siswa;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';
  catatan?: string;
  onStatusChange: (id_siswa: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpha') => void;
  onCatatanChange: (id_siswa: string, catatan: string) => void;
  onSiswaClick?: (siswa: Siswa) => void;
}

const StudentAttendanceRow: React.FC<StudentAttendanceRowProps> = ({
  siswa,
  status,
  catatan = '',
  onStatusChange,
  onCatatanChange,
  onSiswaClick
}) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusButtonStyle = (buttonStatus: string, currentStatus: string) => {
    const isSelected = buttonStatus === currentStatus;
    
    switch (buttonStatus) {
      case 'Hadir':
        return isSelected 
          ? 'bg-green-500 text-white hover:bg-green-600' 
          : 'bg-gray-200 text-gray-600 hover:bg-green-100';
      case 'Izin':
        return isSelected 
          ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
          : 'bg-gray-200 text-gray-600 hover:bg-yellow-100';
      case 'Sakit':
        return isSelected 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : 'bg-gray-200 text-gray-600 hover:bg-blue-100';
      case 'Alpha':
        return isSelected 
          ? 'bg-red-500 text-white hover:bg-red-600' 
          : 'bg-gray-200 text-gray-600 hover:bg-red-100';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  const handleSiswaClick = () => {
    if (onSiswaClick) {
      onSiswaClick(siswa);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
      {/* Student Info */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Avatar 
          className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
          onClick={handleSiswaClick}
        >
          <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
          <AvatarFallback className="text-xs">{getInitials(siswa.nama_lengkap)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p 
            className="font-medium text-sm cursor-pointer hover:text-blue-600 transition-colors truncate"
            onClick={handleSiswaClick}
          >
            {siswa.nama_lengkap}
          </p>
          <p className="text-xs text-gray-500">NISN: {siswa.nisn}</p>
        </div>
      </div>
      
      {/* Status Buttons */}
      <div className="flex gap-1">
        {(['Hadir', 'Izin', 'Sakit', 'Alpha'] as const).map((buttonStatus) => (
          <Button
            key={buttonStatus}
            size="sm"
            variant="outline"
            className={`text-xs px-2 py-1 h-7 ${getStatusButtonStyle(buttonStatus, status)}`}
            onClick={() => onStatusChange(siswa.id_siswa, buttonStatus)}
          >
            {buttonStatus}
          </Button>
        ))}
      </div>

      {/* Notes Input */}
      <div className="w-32">
        <Input
          placeholder="Catatan..."
          value={catatan}
          onChange={(e) => onCatatanChange(siswa.id_siswa, e.target.value)}
          className="text-xs h-7"
        />
      </div>
    </div>
  );
};

export default StudentAttendanceRow;
