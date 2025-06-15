
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface RiwayatAbsensiFiltersProps {
  selectedMapel: string;
  selectedKelas: string;
  mapelList: MataPelajaran[];
  kelasList: Kelas[];
  onMapelChange: (value: string) => void;
  onKelasChange: (value: string) => void;
}

const RiwayatAbsensiFilters: React.FC<RiwayatAbsensiFiltersProps> = ({
  selectedMapel,
  selectedKelas,
  mapelList,
  kelasList,
  onMapelChange,
  onKelasChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Mata Pelajaran</label>
            <Select value={selectedMapel} onValueChange={onMapelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata pelajaran" />
              </SelectTrigger>
              <SelectContent>
                {mapelList.length > 1 && (
                  <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                )}
                {mapelList.map((mapel) => (
                  <SelectItem key={mapel.id_mapel} value={mapel.id_mapel}>
                    {mapel.nama_mapel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Kelas</label>
            <Select value={selectedKelas} onValueChange={onKelasChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
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
};

export default RiwayatAbsensiFilters;
