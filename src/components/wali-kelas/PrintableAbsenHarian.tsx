
import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface SiswaAbsensi {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
  status_absensi: Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alpha' | null>;
}

interface JurnalHari {
  id_jurnal: string;
  mata_pelajaran: string;
  nama_guru: string;
  jam_pelajaran: number;
  judul_materi: string;
}

interface PrintableAbsenHarianProps {
  tanggal: string;
  siswaAbsensi: SiswaAbsensi[];
  jurnalHari: JurnalHari[];
  namaKelas: string;
  waliKelas: string;
}

const PrintableAbsenHarian: React.FC<PrintableAbsenHarianProps> = ({
  tanggal,
  siswaAbsensi,
  jurnalHari,
  namaKelas,
  waliKelas
}) => {
  const getStatusSymbol = (status: string | null) => {
    switch (status) {
      case 'Hadir': return '✓';
      case 'Izin': return 'I';
      case 'Sakit': return 'S';
      case 'Alpha': return 'A';
      default: return '';
    }
  };

  const formatTanggal = (tanggalStr: string) => {
    try {
      const date = new Date(tanggalStr);
      return format(date, 'dd MMMM yyyy', { locale: id });
    } catch {
      return tanggalStr;
    }
  };

  // Sort jurnal by jam_pelajaran
  const sortedJurnalHari = [...jurnalHari].sort((a, b) => a.jam_pelajaran - b.jam_pelajaran);
  const maxJP = Math.max(...sortedJurnalHari.map(j => j.jam_pelajaran), 8);

  return (
    <div className="print:block hidden bg-white text-black p-8 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold mb-2">PRESENSI HARIAN BULAN {format(new Date(tanggal), 'MMMM yyyy', { locale: id }).toUpperCase()}</h1>
        <h2 className="text-lg font-bold">SMK AL-HUDA KOTA KEDIRI</h2>
        <p className="text-sm">TAHUN DIKLAT 2024/2025</p>
      </div>

      {/* Info Kelas dan Wali */}
      <div className="flex justify-between mb-4">
        <div>
          <span className="font-semibold">KELAS : {namaKelas}</span>
        </div>
        <div>
          <span className="font-semibold">WALI KELAS : {waliKelas}</span>
        </div>
      </div>

      {/* Tabel Presensi */}
      <div className="mb-6">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr>
              <th className="border border-black p-1 w-8">No.</th>
              <th className="border border-black p-1 text-left">NAMA</th>
              <th className="border border-black p-1" colSpan={maxJP}>
                Jam Pelajaran Ke
              </th>
              <th className="border border-black p-1 w-8">No.</th>
              <th className="border border-black p-1 text-left">NAMA</th>
              <th className="border border-black p-1" colSpan={maxJP}>
                Jam Pelajaran Ke
              </th>
            </tr>
            <tr>
              <th className="border border-black p-1"></th>
              <th className="border border-black p-1"></th>
              {Array.from({ length: maxJP }, (_, i) => (
                <th key={i} className="border border-black p-1 w-6">{i + 1}</th>
              ))}
              <th className="border border-black p-1"></th>
              <th className="border border-black p-1"></th>
              {Array.from({ length: maxJP }, (_, i) => (
                <th key={i} className="border border-black p-1 w-6">{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(Math.max(siswaAbsensi.length, 30) / 2) }, (_, rowIndex) => {
              const leftStudent = siswaAbsensi[rowIndex];
              const rightStudent = siswaAbsensi[rowIndex + Math.ceil(siswaAbsensi.length / 2)];
              
              return (
                <tr key={rowIndex}>
                  {/* Left side */}
                  <td className="border border-black p-1 text-center">{leftStudent ? rowIndex + 1 : ''}</td>
                  <td className="border border-black p-1 text-left">{leftStudent?.nama_lengkap || ''}</td>
                  {Array.from({ length: maxJP }, (_, jpIndex) => (
                    <td key={jpIndex} className="border border-black p-1 text-center">
                      {leftStudent ? getStatusSymbol(leftStudent.status_absensi[`jp_${jpIndex + 1}`]) : ''}
                    </td>
                  ))}
                  {/* Right side */}
                  <td className="border border-black p-1 text-center">
                    {rightStudent ? rowIndex + Math.ceil(siswaAbsensi.length / 2) + 1 : ''}
                  </td>
                  <td className="border border-black p-1 text-left">{rightStudent?.nama_lengkap || ''}</td>
                  {Array.from({ length: maxJP }, (_, jpIndex) => (
                    <td key={jpIndex} className="border border-black p-1 text-center">
                      {rightStudent ? getStatusSymbol(rightStudent.status_absensi[`jp_${jpIndex + 1}`]) : ''}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Jurnal Mengajar */}
      <div>
        <h3 className="font-bold mb-2">JURNAL MENGAJAR</h3>
        <div className="flex justify-between mb-2">
          <span>Hari: {format(new Date(tanggal), 'EEEE', { locale: id })}</span>
          <span>Tanggal: {formatTanggal(tanggal)}</span>
        </div>
        
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr>
              <th className="border border-black p-2">JP</th>
              <th className="border border-black p-2">PROGRAM DIKLAT</th>
              <th className="border border-black p-2">NAMA GURU dan TOOLMAN</th>
              <th className="border border-black p-2">POKOK PEMBAHASAN</th>
              <th className="border border-black p-2">PARAF</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(sortedJurnalHari.length, 8) }, (_, index) => {
              const jurnal = sortedJurnalHari[index];
              return (
                <tr key={index} className="h-12">
                  <td className="border border-black p-2 text-center">
                    {jurnal?.jam_pelajaran || index + 1}
                  </td>
                  <td className="border border-black p-2">
                    {jurnal?.mata_pelajaran || ''}
                  </td>
                  <td className="border border-black p-2">
                    {jurnal?.nama_guru || ''}
                  </td>
                  <td className="border border-black p-2">
                    {jurnal?.judul_materi || ''}
                  </td>
                  <td className="border border-black p-2 w-16"></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="mt-4 text-xs">
        <p>* Jika ada nama yang salah / belum tercata di presensi mohon melapor ke TU ( Bu Yuni )</p>
      </div>
    </div>
  );
};

export default PrintableAbsenHarian;
