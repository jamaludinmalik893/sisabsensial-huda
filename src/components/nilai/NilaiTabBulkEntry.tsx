
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

  // Convert array to proper format for BulkNilaiEntry
  const bulkValuesRecord = convertedBulkValues.reduce((acc, item) => {
    if (item.key) {
      acc[item.key] = { skor: item.skor || "", catatan: item.catatan || "" };
    }
    return acc;
  }, {} as Record<string, { skor: string; catatan: string }>);

  return (
    <BulkNilaiEntry
      siswaList={siswaList}
      mapelList={mapelList}
      kelasList={kelasList}
      bulkValues={bulkValuesRecord}
      onLoadSiswa={loadSiswaByKelas}
      onBulkValueChange={handleBulkEntryChange}
      onBulkSubmit={handleBulkSubmit}
    />
  );
};

export default NilaiTabBulkEntry;
