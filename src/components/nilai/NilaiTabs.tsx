
import React, { useState } from "react";
import { UserSession } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { NilaiProvider, useNilai } from "./NilaiContext";
import NilaiTabOverview from "./NilaiTabOverview";
import NilaiTabBulkEntry from "./NilaiTabBulkEntry";

interface NilaiTabsProps {
  userSession: UserSession;
}

const NilaiTabsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { selectedSemester, setSelectedSemester, semesterOptions } = useNilai();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Nilai</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="semester">Semester:</Label>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((option) => (
                <SelectItem key={`${option.semester}-${option.tahun}`} value={`${option.semester}-${option.tahun}`}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Rekapitulasi Nilai</TabsTrigger>
          <TabsTrigger value="bulk-entry">Entry Nilai Massal</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <NilaiTabOverview />
        </TabsContent>
        <TabsContent value="bulk-entry" className="space-y-4">
          <NilaiTabBulkEntry />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const NilaiTabs: React.FC<NilaiTabsProps> = ({ userSession }) => {
  return (
    <NilaiProvider userSession={userSession}>
      <NilaiTabsContent />
    </NilaiProvider>
  );
};

export default NilaiTabs;
