
import React from "react";
import BulkNilaiEntry from "./BulkNilaiEntry";
import { useNilai } from "./NilaiContext";

const NilaiTabBulkEntry: React.FC = () => {
  const {
    siswaList,
    mapelList,
    kelasList,
    convertedBulkValues,
    loadSiswaByKelas,
    handleBulkValueChange,
    handleBulkSubmit,
  } = useNilai();

  // Handler adaptasi agar selalu { skor, catatan }
  const handleBulkEntryChange = (siswaId: string, entry: any) => {
    handleBulkValueChange(siswaId, {
      skor: entry.skor?.toString() ?? "",
      catatan: entry.catatan ?? "",
    });
  };

  return (
    <BulkNilaiEntry
      siswaList={siswaList}
      mapelList={mapelList}
      kelasList={kelasList}
      bulkValues={convertedBulkValues}
      onLoadSiswa={loadSiswaByKelas}
      onBulkValueChange={handleBulkEntryChange}
      onBulkSubmit={handleBulkSubmit}
    />
  );
};
export default NilaiTabBulkEntry;
