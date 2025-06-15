
import React from 'react';
import { UserSession } from '@/types';
import RiwayatAbsensiFilters from './absensi/RiwayatAbsensiFilters';
import AbsensiOverviewTable from './absensi/AbsensiOverviewTable';
import { useRiwayatAbsensiData } from '@/hooks/useRiwayatAbsensiData';
import ExportButtons from './ExportButtons';

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

  // Map & export: (absensi di data ini = kehadiran satu siswa untuk satu hari/pelajaran)
  const exportData = riwayatAbsensi.map(item => ({
    Tanggal: item.jurnal_harian?.tanggal_pelajaran ?? "",
    Kelas: item.jurnal_harian?.kelas?.nama_kelas ?? "",
    Mapel: item.jurnal_harian?.mata_pelajaran?.nama_mapel ?? "",
    Siswa: item.siswa?.nama_lengkap ?? "",
    NISN: item.siswa?.nisn ?? "",
    Status: item.status ?? "",
    Catatan: item.catatan ?? ""
    // Optionally you could add: Guru: userSession.guru.nama_lengkap
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Riwayat Absensi</h1>
      <ExportButtons data={exportData} fileName="Laporan_Absensi" />

      <RiwayatAbsensiFilters
        selectedMapel={selectedMapel}
        selectedKelas={selectedKelas}
        mapelList={mapelList}
        kelasList={kelasList}
        onMapelChange={setSelectedMapel}
        onKelasChange={setSelectedKelas}
      />

      <AbsensiOverviewTable 
        riwayatAbsensi={riwayatAbsensi}
        loading={loading}
        selectedMapel={selectedMapel}
        selectedKelas={selectedKelas}
        mapelList={mapelList}
        kelasList={kelasList}
        refreshData={refreshData}
      />
    </div>
  );
};

export default RiwayatAbsensiPage;
