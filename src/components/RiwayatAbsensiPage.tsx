
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

  // Ringkas data absensi untuk export
  const exportData = riwayatAbsensi.map(item => ({
    Tanggal: item.tanggal_pelajaran,
    Kelas: item.kelas?.nama_kelas ?? "",
    Mapel: item.mata_pelajaran?.nama_mapel ?? "",
    Guru: item.guru?.nama_lengkap ?? "",
    Hadir: item.absensi?.filter(a => a.status === "Hadir").length ?? 0,
    Izin: item.absensi?.filter(a => a.status === "Izin").length ?? 0,
    Sakit: item.absensi?.filter(a => a.status === "Sakit").length ?? 0,
    Alpha: item.absensi?.filter(a => a.status === "Alpha").length ?? 0
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
