
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Kelas } from '@/types';

interface StudentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedKelas: string;
  onKelasChange: (value: string) => void;
  kelasList: Kelas[];
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedKelas,
  onKelasChange,
  kelasList
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari siswa (nama atau NISN)..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedKelas} onValueChange={onKelasChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter kelas" />
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
      </CardContent>
    </Card>
  );
};

export default StudentFilters;
