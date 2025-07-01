
import React from "react";
import { UserSession } from "@/types";
import { NilaiProvider } from "./nilai/NilaiContext";
import BulkNilaiEntry from "./nilai/BulkNilaiEntry";
import { useNilai } from "./nilai/NilaiContext";

interface NilaiEntryPageProps {
  userSession: UserSession;
}

const NilaiEntryPage: React.FC<NilaiEntryPageProps> = ({ userSession }) => {
  return (
    <NilaiProvider userSession={userSession}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Entry Nilai Massal</h1>
        <NilaiEntryContent />
      </div>
    </NilaiProvider>
  );
};

function NilaiEntryContent() {
  const {
    siswa,
    mataPelajaran,
    kelas,
    convertedBulkValues,
    loadSiswaByKelas,
    handleBulkValueChange,
    handleBulkSubmit,
  } = useNilai();

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
      siswaList={siswa}
      mapelList={mataPelajaran}
      kelasList={kelas}
      bulkValues={bulkValuesRecord}
      onLoadSiswa={loadSiswaByKelas}
      onBulkValueChange={handleBulkEntryChange}
      onBulkSubmit={handleBulkSubmit}
    />
  );
}

export default NilaiEntryPage;
