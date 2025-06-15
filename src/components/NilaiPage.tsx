import React, { useState } from 'react';
import { UserSession } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkNilaiEntry from './nilai/BulkNilaiEntry';
import NilaiOverviewTable from './nilai/NilaiOverviewTable';
import NilaiFilters from './nilai/NilaiFilters';
import { useNilaiData } from '@/hooks/useNilaiData';
import { valuesToBulkNilaiEntry } from '@/utils/parseBulkNilai';

interface NilaiPageProps {
  userSession: UserSession;
}

const NilaiPage: React.FC<NilaiPageProps> = ({ userSession }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [selectedJenisNilai, setSelectedJenisNilai] = useState('all');
  
  const {
    nilaiList,
    siswaList,
    mapelList,
    kelasList,
    loading,
    bulkValues,
    loadSiswaByKelas,
    handleBulkValueChange,
    handleBulkSubmit,
    loadNilai,
    updateNilai
  } = useNilaiData(userSession);

  // Filter with correct property access based on type definitions
  const filteredNilai = nilaiList.filter(nilai => {
    // Filter mapel: use id_mapel if exists, fallback to nilai.mata_pelajaran.id_mapel
    const matchMapel =
      selectedMapel === 'all' ||
      (nilai.id_mapel && nilai.id_mapel === selectedMapel) ||
      (nilai.mata_pelajaran && 'id_mapel' in nilai.mata_pelajaran && nilai.mata_pelajaran.id_mapel === selectedMapel);

    // Filter kelas: compare using nama_kelas, since id_kelas missing in siswa
    let matchKelas = selectedKelas === 'all';
    if (!matchKelas) {
      // Find nama_kelas target via kelasList, fallback to selectedKelas if not found (should not happen)
      const targetKelas = kelasList.find(k => k.id_kelas === selectedKelas);
      const targetNamaKelas = targetKelas?.nama_kelas ?? '';
      matchKelas = nilai.siswa?.kelas?.nama_kelas === targetNamaKelas;
    }

    // Jenis nilai
    const matchJenis =
      selectedJenisNilai === 'all' ||
      nilai.jenis_nilai === selectedJenisNilai;

    return matchMapel && matchKelas && matchJenis;
  });

  // Gunakan parser utility baru agar robust support nilai { skor, catatan }
  const convertedBulkValues = valuesToBulkNilaiEntry(bulkValues);

  // Handle bulk value change with proper type conversion
  const handleBulkEntryChange = (siswaId: string, entry: any) => {
    // Selalu masukkan { skor, catatan }
    handleBulkValueChange(siswaId, {
      skor: entry.skor?.toString() ?? '',
      catatan: entry.catatan ?? ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manajemen Nilai</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Rekapitulasi Nilai</TabsTrigger>
          <TabsTrigger value="bulk-entry">Entry Nilai Massal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <NilaiFilters
            selectedMapel={selectedMapel}
            setSelectedMapel={setSelectedMapel}
            selectedKelas={selectedKelas}
            setSelectedKelas={setSelectedKelas}
            selectedJenisNilai={selectedJenisNilai}
            setSelectedJenisNilai={setSelectedJenisNilai}
            mapelList={mapelList}
            kelasList={kelasList}
          />
          
          <NilaiOverviewTable 
            filteredNilai={filteredNilai}
            loading={loading}
            selectedMapel={selectedMapel}
            selectedKelas={selectedKelas}
            mapelList={mapelList}
            kelasList={kelasList}
            onUpdateNilai={async (nilaiId: string, newSkor: number, newCatatan: string) => {
              await updateNilai(nilaiId, newSkor, newCatatan);
            }}
          />
        </TabsContent>
        
        <TabsContent value="bulk-entry" className="space-y-4">
          <BulkNilaiEntry
            siswaList={siswaList}
            mapelList={mapelList}
            kelasList={kelasList}
            bulkValues={valuesToBulkNilaiEntry(bulkValues)}
            onLoadSiswa={loadSiswaByKelas}
            onBulkValueChange={handleBulkEntryChange}
            onBulkSubmit={handleBulkSubmit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NilaiPage;
