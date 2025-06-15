
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageCircle } from 'lucide-react';
import StudentAvatarCell from "../nilai/StudentAvatarCell";

interface StudentAttendance {
  siswa: {
    id_siswa: string;
    nama_lengkap: string;
    nisn: string;
    jenis_kelamin: string;
    tanggal_lahir: string;
    tempat_lahir: string;
    alamat: string;
    nomor_telepon?: string;
    nama_orang_tua: string;
    nomor_telepon_orang_tua?: string;
    tahun_masuk: number;
    foto_url?: string;
    kelas?: {
      nama_kelas: string;
    };
    guru_wali?: {
      nama_lengkap: string;
    };
  };
  attendances: { [dateKey: string]: {status: string; catatan?: string; materi: string; id_absensi: string} };
  summary: {
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
    total: number;
  };
}

interface AbsensiTableRowProps {
  studentData: StudentAttendance;
  dateList: Array<[string, string]>;
  onSiswaClick: (siswa: any) => void;
  onAbsensiDoubleClick: (attendance: any, dateKey: string, siswa: any) => void;
}

const AbsensiTableRow: React.FC<AbsensiTableRowProps> = ({
  studentData,
  dateList,
  onSiswaClick,
  onAbsensiDoubleClick
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hadir': return 'bg-green-100 text-green-800';
      case 'Izin': return 'bg-yellow-100 text-yellow-800';
      case 'Sakit': return 'bg-blue-100 text-blue-800';
      case 'Alpha': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="p-2">
        <StudentAvatarCell
          siswa={studentData.siswa}
          onClick={() => onSiswaClick(studentData.siswa)}
          size="sm"
        />
      </TableCell>
      <TableCell className="p-2 align-middle">
        <button
          onClick={() => onSiswaClick(studentData.siswa)}
          className="text-left hover:text-blue-600 hover:underline transition-colors"
        >
          <div className="text-sm font-medium">{studentData.siswa.nama_lengkap}</div>
          <div className="text-xs text-gray-500">{studentData.siswa.nisn}</div>
        </button>
      </TableCell>
      {dateList.slice(0, 10).map(([date]) => (
        <TableCell key={date} className="text-center p-2">
          {studentData.attendances[date] ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="relative cursor-pointer"
                  onDoubleClick={() => onAbsensiDoubleClick(
                    studentData.attendances[date], 
                    date, 
                    studentData.siswa
                  )}
                >
                  <Badge 
                    className={`text-xs ${getStatusColor(studentData.attendances[date].status)}`}
                  >
                    {studentData.attendances[date].status.charAt(0)}
                  </Badge>
                  {studentData.attendances[date].catatan && (
                    <MessageCircle className="absolute -top-1 -right-1 h-3 w-3 text-blue-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p>Status: {studentData.attendances[date].status}</p>
                  <p>Materi: {studentData.attendances[date].materi}</p>
                  {studentData.attendances[date].catatan && (
                    <p>Catatan: {studentData.attendances[date].catatan}</p>
                  )}
                  <p className="text-gray-400 mt-1">Double klik untuk edit</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </TableCell>
      ))}
      <TableCell className="text-center p-2 bg-green-50">
        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
          {studentData.summary.hadir}
        </Badge>
      </TableCell>
      <TableCell className="text-center p-2 bg-yellow-50">
        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
          {studentData.summary.izin}
        </Badge>
      </TableCell>
      <TableCell className="text-center p-2 bg-blue-50">
        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
          {studentData.summary.sakit}
        </Badge>
      </TableCell>
      <TableCell className="text-center p-2 bg-red-50">
        <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
          {studentData.summary.alpha}
        </Badge>
      </TableCell>
      <TableCell className="text-center p-2">
        <Badge variant="outline" className="text-xs font-semibold">
          {studentData.summary.total}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

export default AbsensiTableRow;
