
import React from 'react';
import { UserSession } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import PembelajaranDataForm from './absensi/PembelajaranDataForm';
import AbsensiList from './absensi/AbsensiList';
import { useAbsensiData } from '@/hooks/useAbsensiData';

interface AbsensiPageProps {
  userSession: UserSession;
}

const AbsensiPage: React.FC<AbsensiPageProps> = ({ userSession }) => {
  const {
    selectedKelas,
    selectedMapel,
    judulMateri,
    materiDiajarkan,
    waktuMulai,
    waktuSelesai,
    siswaList,
    absensiData,
    absensiCatatan,
    kelasList,
    mapelList,
    loading,
    today,
    tanggalPelajaran,
    setTanggalPelajaran,
    setSelectedKelas,
    setSelectedMapel,
    setJudulMateri,
    setMateriDiajarkan,
    setWaktuMulai,
    setWaktuSelesai,
    updateAbsensiStatus,
    updateAbsensiCatatan,
    saveAbsensi
  } = useAbsensiData(userSession);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Absensi Harian</h1>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(today).toLocaleDateString('id-ID')}
        </Badge>
      </div>

      <PembelajaranDataForm
        selectedKelas={selectedKelas}
        selectedMapel={selectedMapel}
        judulMateri={judulMateri}
        materiDiajarkan={materiDiajarkan}
        waktuMulai={waktuMulai}
        waktuSelesai={waktuSelesai}
        kelasList={kelasList}
        mapelList={mapelList}
        onKelasChange={setSelectedKelas}
        onMapelChange={setSelectedMapel}
        onJudulMateriChange={setJudulMateri}
        onMateriDiajarkanChange={setMateriDiajarkan}
        onWaktuMulaiChange={setWaktuMulai}
        onWaktuSelesaiChange={setWaktuSelesai}
        tanggalPelajaran={tanggalPelajaran}
        onTanggalPelajaranChange={setTanggalPelajaran}
      />

      {selectedKelas && siswaList.length > 0 && (
        <AbsensiList
          siswaList={siswaList}
          absensiData={absensiData}
          absensiCatatan={absensiCatatan}
          loading={loading}
          onStatusUpdate={updateAbsensiStatus}
          onCatatanUpdate={updateAbsensiCatatan}
          onSaveAbsensi={saveAbsensi}
        />
      )}
    </div>
  );
};

export default AbsensiPage;
