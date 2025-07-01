
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserSession } from "@/types";
import type { Siswa as SiswaIndex } from "@/types/index";
import { Nilai, Siswa, MataPelajaran, Kelas, BulkNilaiData } from "@/types/nilai";
import { useNilaiQueries } from "@/hooks/useNilaiQueries";
import { useBulkNilai } from "@/hooks/useBulkNilai";
import { useNilaiData } from "@/hooks/useNilaiData";
import { getCurrentSemester, getSemesterOptions } from "@/types/semester";

interface NilaiContextType {
  nilai: Nilai[];
  siswa: SiswaIndex[];
  mataPelajaran: MataPelajaran[];
  kelas: Kelas[];
  bulkNilai: BulkNilaiData[];
  convertedBulkValues: any[];
  selectedSemester: string;
  setSelectedSemester: (semester: string) => void;
  semesterOptions: Array<{semester: string; tahun: number; label: string}>;
  loadNilai: (semester?: string) => Promise<void>;
  // Additional properties for compatibility
  nilaiList: Nilai[];
  siswaList: SiswaIndex[];
  mapelList: MataPelajaran[];
  kelasList: Kelas[];
  loading: boolean;
  loadSiswaByKelas: (kelasId: string) => Promise<void>;
  handleBulkValueChange: (siswaId: string, value: any) => void;
  handleBulkSubmit: (selectedMapel: string, jenisNilai: string, judulTugas: string, tanggalTugasDibuat: string) => Promise<boolean>;
  updateNilai: (nilaiId: string, newSkor: number, newCatatan?: string) => Promise<boolean>;
  deleteNilai: (nilaiId: string) => Promise<boolean>;
}

const NilaiContext = createContext<NilaiContextType | undefined>(undefined);

interface NilaiProviderProps {
  children: ReactNode;
  userSession: UserSession;
}

export const NilaiProvider: React.FC<NilaiProviderProps> = ({ children, userSession }) => {
  const currentSemester = getCurrentSemester();
  const [selectedSemester, setSelectedSemester] = useState(`${currentSemester.semester}-${currentSemester.tahun}`);
  const semesterOptions = getSemesterOptions();

  const nilaiData = useNilaiData(userSession);

  const value: NilaiContextType = {
    nilai: nilaiData.nilaiList,
    siswa: nilaiData.siswaList as SiswaIndex[],
    mataPelajaran: nilaiData.mapelList,
    kelas: nilaiData.kelasList,
    bulkNilai: [],
    convertedBulkValues: Object.entries(nilaiData.bulkValues).map(([key, value]) => ({ key, ...value })),
    selectedSemester,
    setSelectedSemester,
    semesterOptions,
    loadNilai: nilaiData.loadNilai,
    // Additional properties for compatibility
    nilaiList: nilaiData.nilaiList,
    siswaList: nilaiData.siswaList as SiswaIndex[],
    mapelList: nilaiData.mapelList,
    kelasList: nilaiData.kelasList,
    loading: nilaiData.loading,
    loadSiswaByKelas: nilaiData.loadSiswaByKelas,
    handleBulkValueChange: nilaiData.handleBulkValueChange,
    handleBulkSubmit: nilaiData.handleBulkSubmit,
    updateNilai: nilaiData.updateNilai,
    deleteNilai: nilaiData.deleteNilai
  };

  return <NilaiContext.Provider value={value}>{children}</NilaiContext.Provider>;
};

export const useNilai = (): NilaiContextType => {
  const context = useContext(NilaiContext);
  if (!context) {
    throw new Error("useNilai must be used within a NilaiProvider");
  }
  return context;
};
