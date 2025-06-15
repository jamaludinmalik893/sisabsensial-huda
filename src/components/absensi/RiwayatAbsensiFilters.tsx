import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import ExportButtons from '../ExportButtons';

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface StudentAttendance {
  siswa: {
    id_siswa: string;
    nama_lengkap: string;
    nisn: string;
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

interface RiwayatAbsensiFiltersProps {
  selectedMapel: string;
  selectedKelas: string;
  mapelList: MataPelajaran[];
  kelasList: Kelas[];
  onMapelChange: (value: string) => void;
  onKelasChange: (value: string) => void;
  studentAttendanceData: StudentAttendance[];
  dateList: Array<[string, string]>;
}

const RiwayatAbsensiFilters: React.FC<RiwayatAbsensiFiltersProps> = ({
  selectedMapel,
  selectedKelas,
  mapelList,
  kelasList,
  onMapelChange,
  onKelasChange,
  studentAttendanceData,
  dateList
}) => {
  // Bentuk data export format rekapitulasi absensi
  const exportData = React.useMemo(() => {
    // Header rekap: No, Nama, [tanggal...], Hadir, Izin, Sakit, Alpha
    return studentAttendanceData.map((student, idx) => {
      // Untuk setiap tanggal, catat status singkat/H/I/S/A/-
      const kehadiran = Object.fromEntries(
        dateList.map(([date]) => [
          date,
          student.attendances[date]
            ? (
              student.attendances[date].status === 'Hadir' ? 'H'
              : student.attendances[date].status === 'Izin' ? 'I'
              : student.attendances[date].status === 'Sakit' ? 'S'
              : student.attendances[date].status === 'Alpha' ? 'A'
              : '-'
            )
            : '-'
        ])
      );
      return {
        No: idx + 1,
        Nama: student.siswa.nama_lengkap,
        ...kehadiran,
        Hadir: student.summary.hadir,
        Izin: student.summary.izin,
        Sakit: student.summary.sakit,
        Alpha: student.summary.alpha,
      };
    });
  }, [studentAttendanceData, dateList]);

  const columns = ["No", "Nama", ...dateList.map(([date]) => date), "Hadir", "Izin", "Sakit", "Alpha"];

  // Mendapatkan nama mapel & kelas dari id terpilih
  const mapelName = selectedMapel === "all"
    ? "Semua Mata Pelajaran"
    : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel ?? "";
  const kelasName = selectedKelas === "all"
    ? "Semua Kelas"
    : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas ?? "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Mata Pelajaran</label>
            <Select value={selectedMapel} onValueChange={onMapelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata pelajaran" />
              </SelectTrigger>
              <SelectContent>
                {mapelList.length > 1 && (
                  <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                )}
                {mapelList.map((mapel) => (
                  <SelectItem key={mapel.id_mapel} value={mapel.id_mapel}>
                    {mapel.nama_mapel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Kelas</label>
            <Select value={selectedKelas} onValueChange={onKelasChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelasList.map((kelas) => (
                  <SelectItem key={kelas.id_kelas} value={kelas.id_kelas}>
                    {kelas.nama_kelas}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Tombol Export/Cetak */}
        <div className="pt-2">
          <ExportButtons
            data={exportData}
            fileName="Rekapitulasi_Absensi"
            columns={columns}
            mapelName={mapelName}
            kelasName={kelasName}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RiwayatAbsensiFilters;
