
import React, { createContext, useContext } from "react";
import { UserSession } from "@/types";
import { useNilaiData } from "@/hooks/useNilaiData";
import { valuesToBulkNilaiEntry } from "@/utils/parseBulkNilai";

const NilaiContext = createContext<any | undefined>(undefined);

export const NilaiProvider = ({ userSession, children }: { userSession: UserSession; children: React.ReactNode }) => {
  const nilai = useNilaiData(userSession);

  // Derivative values for bulk
  const convertedBulkValues = valuesToBulkNilaiEntry(nilai.bulkValues);

  return (
    <NilaiContext.Provider value={{ ...nilai, convertedBulkValues }}>
      {children}
    </NilaiContext.Provider>
  );
};

export const useNilai = () => {
  const context = useContext(NilaiContext);
  if (!context) throw new Error("useNilai must be used within NilaiProvider");
  return context;
};
