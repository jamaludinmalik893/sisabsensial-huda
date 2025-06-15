
import React, { useState } from 'react';
import { UserSession } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkNilaiEntry from './nilai/BulkNilaiEntry';
import NilaiOverviewTable from './nilai/NilaiOverviewTable';
import NilaiFilters from './nilai/NilaiFilters';
import { useNilaiData } from '@/hooks/useNilaiData';

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

  // Filter nilai based on selected filters
  const filteredNilai = nilaiList.filter(nilai => {
    const matchMapel = selectedMapel === 'all' || nilai.mata_pelajaran.nama_mapel === mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
    const matchKelas = selectedKelas === 'all' || (nilai.siswa.kelas && nilai.siswa.kelas.nama_kelas === kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas);
    const matchJenis = selectedJenisNilai === 'all' || nilai.jenis_nilai === selectedJenisNilai;
    return matchMapel && matchKelas && matchJenis;
  });

  // Convert string bulk values to the expected format for BulkNilaiEntry component
  const convertedBulkValues = Object.entries(bulkValues).reduce((acc, [key, value]) => {
    if (value.trim() !== '') {
      acc[key] = {
        id_siswa: key,
        skor: parseFloat(value),
        catatan: ''
      };
    }
    return acc;
  }, {} as Record<string, any>);

  // Handle bulk value change with proper type conversion
  const handleBulkEntryChange = (siswaId: string, entry: any) => {
    handleBulkValueChange(siswaId, entry.skor.toString());
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
            siswaList={siswaList} {/* Sudah bentuk index.ts, dijamin valid dari hook */}
            mapelList={mapelList}
            kelasList={kelasList}
            bulkValues={convertedBulkValues}
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
