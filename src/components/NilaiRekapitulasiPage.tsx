
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
  const { nilai, mataPelajaran, kelas, loading, updateNilai, deleteNilai } = useNilai();

  // Kumpulkan daftar tugas dan tanggalnya seperti di NilaiOverviewTable
  const taskInfoList = React.useMemo(() => {
    const taskSet = new Set<string>();
    const taskData: { [key: string]: { name: string, date: string } } = {};
    nilai.forEach(nilaiItem => {
      const key = `${nilaiItem.judul_tugas}|${nilaiItem.tanggal_tugas_dibuat}`;
      if (!taskSet.has(key)) {
        taskSet.add(key);
        taskData[key] = { name: nilaiItem.judul_tugas, date: nilaiItem.tanggal_tugas_dibuat };
      }
    });
    return Array.from(taskSet).map(key => taskData[key]);
  }, [nilai]);

  // Susun data export tabel rekap: No, Nama, [tugas-tugas...], Rata-rata
  const exportData = React.useMemo(() => {
    // Group by siswa
    const siswaMap: {
      [id: string]: {
        nama: string;
        nisn: string;
        tugas: { [judul: string]: number | undefined };
        sum: number;
        count: number;
      }
    } = {};

    nilai.forEach(n => {
      const id = n.siswa?.id_siswa ?? "";
      if (!siswaMap[id]) {
        siswaMap[id] = {
          nama: n.siswa?.nama_lengkap ?? "",
          nisn: n.siswa?.nisn ?? "",
          tugas: {},
          sum: 0,
          count: 0,
        };
      }
      siswaMap[id].tugas[`${n.judul_tugas}|${n.tanggal_tugas_dibuat}`] = n.skor;
      siswaMap[id].sum += n.skor;
      siswaMap[id].count += 1;
    });

    // Untuk setiap siswa buat baris export
    return Object.values(siswaMap).map((siswa, idx) => {
      // Hitung rata-rata
      const avg = siswa.count > 0 ? +(siswa.sum / siswa.count).toFixed(2) : 0;
      // Urutkan skor setiap tugas sesuai urutan header taskInfoList
      const nilaiTugas = taskInfoList.map(
        t => (siswa.tugas[`${t.name}|${t.date}`] !== undefined ? siswa.tugas[`${t.name}|${t.date}`] : "-")
      );
      return {
        No: idx + 1,
        Nama: siswa.nama,
        ...taskInfoList.reduce((acc, t, i) => {
          acc[`${t.name}\n${new Date(t.date).toLocaleDateString("id-ID")}`] = nilaiTugas[i];
          return acc;
        }, {} as Record<string, number|string>),
        "Rata-rata": avg
      };
    });
  }, [nilai, taskInfoList]);

  // Kolom-kolom header export (No, Nama, tugas, rata-rata)
  const exportColumns = React.useMemo(() => [
    "No",
    "Nama",
    ...taskInfoList.map(
      t => `${t.name}\n${new Date(t.date).toLocaleDateString("id-ID")}`
    ),
    "Rata-rata"
  ], [taskInfoList]);

  // Ambil filter saat ini dari daftar (ambil mapel "all" = Semua, dst)
  const selectedMapel = "all";
  const selectedKelas = "all";
  // Ubah sesuai kebutuhan, misal ambil dari state jika ada filter state

  const mapelName = selectedMapel === "all"
    ? "Semua Mata Pelajaran"
    : mataPelajaran.find(m => m.id_mapel === selectedMapel)?.nama_mapel ?? "";
  const kelasName = selectedKelas === "all"
    ? "Semua Kelas"
    : kelas.find(k => k.id_kelas === selectedKelas)?.nama_kelas ?? "";

  // Update function signatures to match expected types
  const handleUpdateNilai = async (nilaiId: string, newSkor: number, newCatatan: string = "") => {
    await updateNilai(nilaiId, newSkor, newCatatan);
  };

  const handleDeleteNilai = async (nilaiId: string) => {
    await deleteNilai(nilaiId);
  };

  return (
    <div className="relative">
      {/* Filter bar & export buttons */}
      <div className="flex flex-col">
        <div className="mb-2 flex flex-row-reverse items-end">
          {/* Export tombol di pojok kanan bawah filter */}
          <ExportButtons
            data={exportData}
            fileName="Rekap_Nilai_Siswa"
            columns={exportColumns}
            mapelName={mapelName}
            kelasName={kelasName}
          />
        </div>
      </div>
      <NilaiOverviewTable
        filteredNilai={nilai}
        loading={loading}
        selectedMapel={selectedMapel}
        selectedKelas={selectedKelas}
        mapelList={mataPelajaran}
        kelasList={kelas}
        onUpdateNilai={handleUpdateNilai}
        deleteNilai={handleDeleteNilai}
      />
    </div>
  );
}

export default NilaiRekapitulasiPage;
