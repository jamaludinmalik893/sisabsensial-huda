
import React, { useState } from 'react';
import { UserSession } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkNilaiEntry from './nilai/BulkNilaiEntry';
import NilaiOverviewTable from './nilai/NilaiOverviewTable';
import { useNilaiData } from '@/hooks/useNilaiData';

interface NilaiPageProps {
  userSession: UserSession;
}

const NilaiPage: React.FC<NilaiPageProps> = ({ userSession }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
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
          <NilaiOverviewTable 
            loading={loading}
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
            bulkValues={convertedBulkValues}
            loading={loading}
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
