
import React, { useState, useEffect } from 'react';
import { UserSession } from '@/types';
import { Button } from '@/components/ui/button';
import NilaiFilters from './nilai/NilaiFilters';
import NilaiStatistics from './nilai/NilaiStatistics';
import BulkNilaiEntry from './nilai/BulkNilaiEntry';
import NilaiOverviewTable from './nilai/NilaiOverviewTable';
import { useNilaiData } from '@/hooks/useNilaiData';

interface NilaiPageProps {
  userSession: UserSession;
}

const NilaiPage: React.FC<NilaiPageProps> = ({ userSession }) => {
  const [bulkEntryMode, setBulkEntryMode] = useState(false);
  
  // Filter states - using "all" instead of empty strings
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

  useEffect(() => {
    if (selectedMapel !== 'all' && selectedKelas !== 'all') {
      loadSiswaByKelas(selectedKelas);
    }
  }, [selectedKelas]);

  const filteredNilai = nilaiList.filter(nilai => {
    if (selectedMapel !== 'all' && nilai.mata_pelajaran.nama_mapel !== mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel) return false;
    if (selectedJenisNilai !== 'all' && nilai.jenis_nilai !== selectedJenisNilai) return false;
    return true;
  });

  const handleBulkSubmitWrapper = async (judulTugas: string, tanggalTugasDibuat: string) => {
    const success = await handleBulkSubmit(selectedMapel, selectedJenisNilai, judulTugas, tanggalTugasDibuat);
    if (success) {
      setBulkEntryMode(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Nilai</h1>
        <div className="flex gap-2">
          <Button 
            variant={bulkEntryMode ? "destructive" : "default"}
            onClick={() => setBulkEntryMode(!bulkEntryMode)}
          >
            {bulkEntryMode ? "Batal Entry Massal" : "Entry Nilai Massal"}
          </Button>
        </div>
      </div>

      {/* Filter Section */}
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

      {/* Bulk Entry Mode */}
      {bulkEntryMode && (
        <BulkNilaiEntry
          selectedMapel={selectedMapel}
          setSelectedMapel={setSelectedMapel}
          selectedKelas={selectedKelas}
          setSelectedKelas={setSelectedKelas}
          selectedJenisNilai={selectedJenisNilai}
          setSelectedJenisNilai={setSelectedJenisNilai}
          mapelList={mapelList}
          kelasList={kelasList}
          siswaList={siswaList}
          bulkValues={bulkValues}
          handleBulkValueChange={handleBulkValueChange}
          handleBulkSubmit={handleBulkSubmitWrapper}
        />
      )}

      {/* Statistics */}
      <NilaiStatistics filteredNilai={filteredNilai} />

      {/* Rekapitulasi Nilai Table */}
      <NilaiOverviewTable 
        filteredNilai={filteredNilai} 
        loading={loading}
        selectedMapel={selectedMapel}
        selectedKelas={selectedKelas}
        mapelList={mapelList}
        kelasList={kelasList}
        onUpdateNilai={updateNilai}
      />
    </div>
  );
};

export default NilaiPage;
