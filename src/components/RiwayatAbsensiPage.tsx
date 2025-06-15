
import React, { useMemo } from 'react';
import { UserSession } from '@/types';
import RiwayatAbsensiFilters from './absensi/RiwayatAbsensiFilters';
import AbsensiOverviewTable from './absensi/AbsensiOverviewTable';
import { useRiwayatAbsensiData } from '@/hooks/useRiwayatAbsensiData';

interface RiwayatAbsensiPageProps {
  userSession: UserSession;
}

const RiwayatAbsensiPage: React.FC<RiwayatAbsensiPageProps> = ({ userSession }) => {
  const {
    selectedMapel,
    selectedKelas,
    mapelList,
    kelasList,
    riwayatAbsensi,
    loading,
    setSelectedMapel,
    setSelectedKelas,
    refreshData
  } = useRiwayatAbsensiData(userSession);

  // Data filter dan rekap, mirip AbsensiOverviewTable
  const relevantAbsensi = useMemo(() => {
    return riwayatAbsensi.filter(absensi => {
      const mapelName = mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
      const kelasName = kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
      const matchMapel = selectedMapel === 'all' || absensi.jurnal_harian.mata_pelajaran.nama_mapel === mapelName;
      const matchKelas = selectedKelas === 'all' || absensi.jurnal_harian.kelas.nama_kelas === kelasName;
      return matchMapel && matchKelas;
    });
  }, [riwayatAbsensi, selectedMapel, selectedKelas, mapelList, kelasList]);

  // Dapatkan daftar tanggal unik beserta materi
  const dateList = useMemo(() => {
    const dateMap = new Map<string, string>();
    relevantAbsensi.forEach(absensi => {
      const dateKey = new Date(absensi.jurnal_harian.tanggal_pelajaran).toLocaleDateString('id-ID');
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, absensi.jurnal_harian.judul_materi);
      }
    });
    return Array.from(dateMap.entries()).sort((a, b) => {
      const dateA = new Date(a[0].split('/').reverse().join('-'));
      const dateB = new Date(b[0].split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  }, [relevantAbsensi]);

  // Rekap data siswa (mirip yang di AbsensiOverviewTable)
  const studentAttendanceData = useMemo(() => {
    const grouped: {
      [siswaId: string]: {
        siswa: typeof riwayatAbsensi[0]['siswa'];
        attendances: { [dateKey: string]: {status: string; catatan?: string; materi: string; id_absensi: string} };
        summary: { hadir: number; izin: number; sakit: number; alpha: number; total: number };
      };
    } = {};

    relevantAbsensi.forEach(absensi => {
      const siswaId = absensi.siswa.id_siswa;
      const dateKey = new Date(absensi.jurnal_harian.tanggal_pelajaran).toLocaleDateString('id-ID');
      if (!grouped[siswaId]) {
        grouped[siswaId] = {
          siswa: absensi.siswa,
          attendances: {},
          summary: { hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 }
        };
      }
      grouped[siswaId].attendances[dateKey] = {
        status: absensi.status,
        catatan: absensi.catatan,
        materi: absensi.jurnal_harian.judul_materi,
        id_absensi: absensi.id_absensi
      };
    });

    Object.values(grouped).forEach(studentData => {
      const attendances = Object.values(studentData.attendances);
      studentData.summary = {
        hadir: attendances.filter(a => a.status === 'Hadir').length,
        izin: attendances.filter(a => a.status === 'Izin').length,
        sakit: attendances.filter(a => a.status === 'Sakit').length,
        alpha: attendances.filter(a => a.status === 'Alpha').length,
        total: attendances.length
      };
    });

    return Object.values(grouped).sort((a, b) => a.siswa.nama_lengkap.localeCompare(b.siswa.nama_lengkap));
  }, [relevantAbsensi]);

  // Logika: tampilkan tabel HANYA jika salah satu filter dipilih
  const isFiltered = selectedMapel !== 'all' || selectedKelas !== 'all';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Riwayat Absensi</h1>

      <RiwayatAbsensiFilters
        selectedMapel={selectedMapel}
        selectedKelas={selectedKelas}
        mapelList={mapelList}
        kelasList={kelasList}
        onMapelChange={setSelectedMapel}
        onKelasChange={setSelectedKelas}
        studentAttendanceData={studentAttendanceData}
        dateList={dateList}
      />

      {!isFiltered ? (
        <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
          Silakan pilih <b>mata pelajaran</b> atau <b>kelas</b> terlebih dahulu untuk melihat rekapitulasi absensi.
        </div>
      ) : (
        <AbsensiOverviewTable 
          riwayatAbsensi={riwayatAbsensi}
          loading={loading}
          selectedMapel={selectedMapel}
          selectedKelas={selectedKelas}
          mapelList={mapelList}
          kelasList={kelasList}
          refreshData={refreshData}
        />
      )}
    </div>
  );
};

export default RiwayatAbsensiPage;
