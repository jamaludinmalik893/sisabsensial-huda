
import React from "react";
import NilaiOverviewTable from "./NilaiOverviewTable";
import { useNilai } from "./NilaiContext";

const NilaiTabOverview: React.FC = () => {
  const { nilai, mataPelajaran, kelas, loading, updateNilai, deleteNilai } = useNilai();

  // DEBUG: log isi nilaiList yang di-fetch dari Supabase
  console.log("NilaiTabOverview nilaiList:", nilai);

  // Update function signatures to match expected types
  const handleUpdateNilai = async (nilaiId: string, newSkor: number, newCatatan: string = "") => {
    await updateNilai(nilaiId, newSkor, newCatatan);
  };

  const handleDeleteNilai = async (nilaiId: string) => {
    await deleteNilai(nilaiId);
  };

  // Langsung tampilkan semua nilai tanpa filter
  return (
    <>
      <NilaiOverviewTable
        filteredNilai={nilai}
        loading={loading}
        selectedMapel="all"
        selectedKelas="all"
        mapelList={mataPelajaran}
        kelasList={kelas}
        onUpdateNilai={handleUpdateNilai}
        deleteNilai={handleDeleteNilai}
      />
    </>
  );
};

export default NilaiTabOverview;
