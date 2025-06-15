
import React, { useState } from "react";
import { UserSession } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NilaiProvider } from "./NilaiContext";
import NilaiTabOverview from "./NilaiTabOverview";
import NilaiTabBulkEntry from "./NilaiTabBulkEntry";

interface NilaiTabsProps {
  userSession: UserSession;
}

const NilaiTabs: React.FC<NilaiTabsProps> = ({ userSession }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <NilaiProvider userSession={userSession}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Manajemen Nilai</h1>

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
    </NilaiProvider>
  );
};
export default NilaiTabs;
