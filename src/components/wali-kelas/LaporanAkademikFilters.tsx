
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';

interface LaporanAkademikFiltersProps {
  filters: {
    periode: string;
    tanggalMulai: string;
    tanggalAkhir: string;
    jenisKelamin: string;
    statusKehadiran: string;
    statusNilai: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

const LaporanAkademikFilters: React.FC<LaporanAkademikFiltersProps> = ({
  filters,
  onFilterChange,
  onRefresh,
  loading
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Laporan Akademik
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="periode">Periode</Label>
            <Select value={filters.periode} onValueChange={(value) => onFilterChange('periode', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harian">Harian</SelectItem>
                <SelectItem value="mingguan">Mingguan</SelectItem>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="semester">Semester</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tanggal-mulai">Tanggal Mulai</Label>
            <Input
              type="date"
              value={filters.tanggalMulai}
              onChange={(e) => onFilterChange('tanggalMulai', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tanggal-akhir">Tanggal Akhir</Label>
            <Input
              type="date"
              value={filters.tanggalAkhir}
              onChange={(e) => onFilterChange('tanggalAkhir', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="jenis-kelamin">Jenis Kelamin</Label>
            <Select value={filters.jenisKelamin} onValueChange={(value) => onFilterChange('jenisKelamin', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                <SelectItem value="Perempuan">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status-kehadiran">Status Kehadiran</Label>
            <Select value={filters.statusKehadiran} onValueChange={(value) => onFilterChange('statusKehadiran', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="baik">Kehadiran Baik (≥90%)</SelectItem>
                <SelectItem value="cukup">Kehadiran Cukup (80-89%)</SelectItem>
                <SelectItem value="kurang">Kehadiran Kurang (<80%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status-nilai">Status Nilai</Label>
            <Select value={filters.statusNilai} onValueChange={(value) => onFilterChange('statusNilai', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="sangat-baik">Sangat Baik (≥85)</SelectItem>
                <SelectItem value="baik">Baik (75-84)</SelectItem>
                <SelectItem value="cukup">Cukup (65-74)</SelectItem>
                <SelectItem value="kurang">Kurang (<65)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={onRefresh} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Memuat...' : 'Refresh Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaporanAkademikFilters;
