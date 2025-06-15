
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface FilterState {
  kelas: string;
  mapel: string;
  bulan: string;
}

interface JurnalFilterProps {
  kelasList: Kelas[];
  mapelList: MataPelajaran[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const JurnalFilter: React.FC<JurnalFilterProps> = ({
  kelasList,
  mapelList,
  filters,
  onFilterChange
}) => {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="filter-kelas">Filter Kelas</Label>
            <Select 
              value={filters.kelas} 
              onValueChange={(value) => handleFilterChange('kelas', value)}
            >
              <SelectTrigger id="filter-kelas">
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

          <div>
            <Label htmlFor="filter-mapel">Filter Mata Pelajaran</Label>
            <Select 
              value={filters.mapel} 
              onValueChange={(value) => handleFilterChange('mapel', value)}
            >
              <SelectTrigger id="filter-mapel">
                <SelectValue placeholder="Semua Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                {mapelList.map((mapel) => (
                  <SelectItem key={mapel.id_mapel} value={mapel.id_mapel}>
                    {mapel.nama_mapel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filter-bulan">Filter Bulan</Label>
            <Input
              id="filter-bulan"
              type="month"
              value={filters.bulan}
              onChange={(e) => handleFilterChange('bulan', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JurnalFilter;
