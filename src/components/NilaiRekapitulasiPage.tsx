
import React from "react";
import { UserSession } from "@/types";
import { NilaiProvider } from "./nilai/NilaiContext";
import NilaiOverviewTable from "./nilai/NilaiOverviewTable";
import { useNilai } from "./nilai/NilaiContext";
import ExportButtons from "./ExportButtons";

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

  // Data ringkas untuk export
  const exportData = nilaiList.map(nilai => ({
    Tanggal: new Date(nilai.tanggal_nilai).toLocaleDateString("id-ID"),
    Siswa: nilai.siswa?.nama_lengkap ?? "",
    NISN: nilai.siswa?.nisn ?? "",
    Mapel: nilai.mata_pelajaran?.nama_mapel ?? "",
    Jenis: nilai.jenis_nilai,
    Judul: nilai.judul_tugas,
    Skor: nilai.skor,
    Catatan: nilai.catatan ?? ""
  }));

  return (
    <>
      <ExportButtons data={exportData} fileName="Laporan_Nilai" />
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
}

export default NilaiRekapitulasiPage;
