
import React from "react";
import NilaiOverviewTable from "./NilaiOverviewTable";
import { useNilai } from "./NilaiContext";

const NilaiTabOverview: React.FC = () => {
  const { nilaiList, mapelList, kelasList, loading, updateNilai, deleteNilai } = useNilai();

  // DEBUG: log isi nilaiList yang di-fetch dari Supabase
  console.log("NilaiTabOverview nilaiList:", nilaiList);

  // Langsung tampilkan semua nilai tanpa filter
  return (
    <>
      <NilaiOverviewTable
        filteredNilai={nilaiList}
        loading={loading}
        selectedMapel="all"
        selectedKelas="all"
        mapelList={mapelList}
        kelasList={kelasList}
        onUpdateNilai={updateNilai}
        deleteNilai={deleteNilai}
      />
    </>
  );
};

export default NilaiTabOverview;

