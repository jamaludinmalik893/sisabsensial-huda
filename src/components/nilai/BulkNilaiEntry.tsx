
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save } from 'lucide-react';

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface Siswa {
  id_siswa: string;
  nama_lengkap: string;
  nisn: string;
}

interface BulkNilaiEntry {
  id_siswa: string;
  skor: string;
  catatan: string;
}

interface BulkNilaiEntryProps {
  selectedMapel: string;
  setSelectedMapel: (value: string) => void;
  selectedKelas: string;
  setSelectedKelas: (value: string) => void;
  selectedJenisNilai: string;
  setSelectedJenisNilai: (value: string) => void;
  mapelList: MataPelajaran[];
  kelasList: Kelas[];
  siswaList: Siswa[];
  bulkValues: Record<string, BulkNilaiEntry>;
  handleBulkValueChange: (siswaId: string, field: 'skor' | 'catatan', value: string) => void;
  handleBulkSubmit: () => void;
}

const BulkNilaiEntry: React.FC<BulkNilaiEntryProps> = ({
  selectedMapel,
  setSelectedMapel,
  selectedKelas,
  setSelectedKelas,
  selectedJenisNilai,
  setSelectedJenisNilai,
  mapelList,
  kelasList,
  siswaList,
  bulkValues,
  handleBulkValueChange,
  handleBulkSubmit
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entry Nilai Massal - Mode Excel</CardTitle>
        <p className="text-sm text-gray-600">
          Pilih mata pelajaran, kelas, dan jenis nilai, kemudian masukkan nilai untuk setiap siswa
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Mata Pelajaran *</label>
            <Select value={selectedMapel} onValueChange={setSelectedMapel}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih mata pelajaran" />
              </SelectTrigger>
              <SelectContent>
                {mapelList.map((mapel) => (
                  <SelectItem key={mapel.id_mapel} value={mapel.id_mapel}>
                    {mapel.nama_mapel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Kelas *</label>
            <Select value={selectedKelas} onValueChange={setSelectedKelas}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kelas" />
              </SelectTrigger>
              <SelectContent>
                {kelasList.map((kelas) => (
                  <SelectItem key={kelas.id_kelas} value={kelas.id_kelas}>
                    {kelas.nama_kelas}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Jenis Nilai *</label>
            <Select value={selectedJenisNilai} onValueChange={setSelectedJenisNilai}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis nilai" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tugas Harian">Tugas Harian</SelectItem>
                <SelectItem value="Quiz">Quiz</SelectItem>
                <SelectItem value="UTS">UTS</SelectItem>
                <SelectItem value="UAS">UAS</SelectItem>
                <SelectItem value="Praktikum">Praktikum</SelectItem>
                <SelectItem value="Proyek">Proyek</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedMapel && selectedKelas && selectedJenisNilai && siswaList.length > 0 && (
          <>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead className="w-24">Nilai (0-100)</TableHead>
                    <TableHead className="w-48">Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siswaList.map((siswa, index) => (
                    <TableRow key={siswa.id_siswa}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{siswa.nisn}</TableCell>
                      <TableCell>{siswa.nama_lengkap}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={bulkValues[siswa.id_siswa]?.skor || ''}
                          onChange={(e) => handleBulkValueChange(siswa.id_siswa, 'skor', e.target.value)}
                          placeholder="0-100"
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={bulkValues[siswa.id_siswa]?.catatan || ''}
                          onChange={(e) => handleBulkValueChange(siswa.id_siswa, 'catatan', e.target.value)}
                          placeholder="Catatan (opsional)"
                          className="w-full"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleBulkSubmit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Simpan Semua Nilai
              </Button>
            </div>
          </>
        )}

        {selectedMapel && selectedKelas && selectedJenisNilai && siswaList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada siswa di kelas yang dipilih
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkNilaiEntry;
