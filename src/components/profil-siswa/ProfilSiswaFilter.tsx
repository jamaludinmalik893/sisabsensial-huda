
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from "lucide-react";

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}
interface ProfilSiswaFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterKelas: string;
  setFilterKelas: (kelas: string) => void;
  kelasList: Kelas[];
}

const ProfilSiswaFilter: React.FC<ProfilSiswaFilterProps> = ({
  searchTerm,
  setSearchTerm,
  filterKelas,
  setFilterKelas,
  kelasList,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Filter className="h-5 w-5" />
        Filter &amp; Pencarian
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Cari Siswa</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Filter Kelas</label>
          <Select value={filterKelas} onValueChange={setFilterKelas}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {kelasList.map((kelas) => (
                <SelectItem key={kelas.id_kelas} value={kelas.id_kelas}>
                  {kelas.nama_kelas}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ProfilSiswaFilter;
