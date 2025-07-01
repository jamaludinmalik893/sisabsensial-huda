import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserSession } from "@/types";
import { Nilai, Siswa, MataPelajaran, Kelas, BulkNilaiData } from "@/types/nilai";
import { useNilaiQueries } from "@/hooks/useNilaiQueries";
import { useBulkNilai } from "@/hooks/useBulkNilai";
import { getCurrentSemester, getSemesterOptions } from "@/types/semester";

interface NilaiContextType {
  nilai: Nilai;
  siswa: Siswa[];
  mataPelajaran: MataPelajaran[];
  kelas: Kelas[];
  bulkNilai: BulkNilaiData[];
  convertedBulkValues: any[];
  selectedSemester: string;
  setSelectedSemester: (semester: string) => void;
  semesterOptions: Array<{semester: string; tahun: number; label: string}>;
  loadNilai: (semester?: string) => Promise<void>;
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

  const {
    loadMataPelajaranByGuru,
    loadKelas,
    loadNilai: loadNilaiQuery,
    loadSiswaByKelas,
    updateNilai: updateNilaiQuery,
    deleteNilai: deleteNilaiQuery
  } = useNilaiQueries(userSession);

  const { bulkValues, ...nilai } = useNilaiData(userSession);
  const convertedBulkValues = valuesToBulkNilaiEntry(bulkValues);

  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNilai = async (semester?: string) => {
    try {
      setLoading(true);
      const semesterToUse = semester || selectedSemester;
      const data = await loadNilaiQuery(semesterToUse);
      setNilaiList(data);
    } catch (error) {
      console.error("Error loading nilai:", error);
      setNilaiList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapel();
    loadKelas();
  }, []);

  useEffect(() => {
    loadNilai();
  }, [selectedSemester]);

  const value: NilaiContextType = {
    nilai,
    siswa: nilai.siswa,
    mataPelajaran: nilai.mataPelajaran,
    kelas: nilai.kelas,
    bulkNilai: nilai.bulkNilai,
    convertedBulkValues,
    selectedSemester,
    setSelectedSemester,
    semesterOptions,
    loadNilai
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
