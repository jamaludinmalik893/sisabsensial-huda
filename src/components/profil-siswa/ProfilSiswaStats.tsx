
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface ProfilSiswaStatsProps {
  stats: {
    total: number;
    lakiLaki: number;
    perempuan: number;
    tahunIni: number;
  };
}

const ProfilSiswaStats: React.FC<ProfilSiswaStatsProps> = ({ stats }) => (
  <>
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Profil Siswa</h1>
      <Badge variant="outline" className="text-sm">
        <Users className="w-4 h-4 mr-1" />
        {stats.total} Siswa
      </Badge>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Siswa</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.lakiLaki}</div>
          <div className="text-sm text-gray-500">Laki-laki</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">{stats.perempuan}</div>
          <div className="text-sm text-gray-500">Perempuan</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.tahunIni}</div>
          <div className="text-sm text-gray-500">Siswa Baru</div>
        </CardContent>
      </Card>
    </div>
  </>
);

export default ProfilSiswaStats;
