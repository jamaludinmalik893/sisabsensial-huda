
import React from 'react';
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
    setSelectedKelas
  } = useRiwayatAbsensiData(userSession);

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
      />

      <AbsensiOverviewTable 
        riwayatAbsensi={riwayatAbsensi}
        loading={loading}
        selectedMapel={selectedMapel}
        selectedKelas={selectedKelas}
        mapelList={mapelList}
        kelasList={kelasList}
      />
    </div>
  );
};

export default RiwayatAbsensiPage;
