
import React from "react";
import { UserSession } from "@/types";
import { NilaiProvider } from "./nilai/NilaiContext";
import NilaiOverviewTable from "./nilai/NilaiOverviewTable";
import { useNilai } from "./nilai/NilaiContext";

interface NilaiRekapitulasiPageProps {
  userSession: UserSession;
}

const NilaiRekapitulasiPage: React.FC<NilaiRekapitulasiPageProps> = ({ userSession }) => {
  return (
    <NilaiProvider userSession={userSession}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Rekapitulasi Nilai Siswa</h1>
        <NilaiRekapitulasiContent />
      </div>
    </NilaiProvider>
  );
};

function NilaiRekapitulasiContent() {
  const { nilaiList, mapelList, kelasList, loading, updateNilai, deleteNilai } = useNilai();

  return (
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
  );
}

export default NilaiRekapitulasiPage;
