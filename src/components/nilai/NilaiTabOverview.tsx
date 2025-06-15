
import React, { useState } from "react";
import NilaiFilters from "./NilaiFilters";
import NilaiOverviewTable from "./NilaiOverviewTable";
import { useNilai } from "./NilaiContext";

const NilaiTabOverview: React.FC = () => {
  const {
    nilaiList,
    mapelList,
    kelasList,
    loading,
    updateNilai,
  } = useNilai();

  const [selectedMapel, setSelectedMapel] = useState("all");
  const [selectedKelas, setSelectedKelas] = useState("all");
  const [selectedJenisNilai, setSelectedJenisNilai] = useState("all");

  // Filter dengan property id_mapel dan id_kelas yang VALID
  const filteredNilai = nilaiList.filter(nilai => {
    const matchMapel =
      selectedMapel === "all" ||
      (nilai.mata_pelajaran && nilai.mata_pelajaran.id_mapel === selectedMapel);

    let matchKelas = selectedKelas === "all";
    if (!matchKelas) {
      matchKelas = nilai.siswa?.kelas?.id_kelas === selectedKelas;
    }

    const matchJenis =
      selectedJenisNilai === "all" || nilai.jenis_nilai === selectedJenisNilai;

    return matchMapel && matchKelas && matchJenis;
  });

  return (
    <>
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
        onUpdateNilai={updateNilai}
      />
    </>
  );
};

export default NilaiTabOverview;
