import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save } from 'lucide-react';
import ProfilSiswaPopup from '../ProfilSiswaPopup';
import StudentAvatarCell from './StudentAvatarCell';

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
  foto_url?: string;
  jenis_kelamin?: string;
}

interface BulkNilaiEntry {
  id_siswa: string;
  skor: number;
  catatan: string;
}

interface BulkNilaiEntryProps {
  siswaList: Siswa[];
  mapelList: MataPelajaran[];
  kelasList: Kelas[];
  bulkValues: Record<string, BulkNilaiEntry>;
  onBulkValueChange: (siswaId: string, entry: BulkNilaiEntry) => void;
  onBulkSubmit: (selectedMapel: string, jenisNilai: string, judulTugas: string, tanggalTugasDibuat: string) => Promise<boolean>;
  onLoadSiswa: (kelasId: string) => Promise<void>;
}

const BulkNilaiEntry: React.FC<BulkNilaiEntryProps> = ({
  siswaList,
  mapelList,
  kelasList,
  bulkValues,
  onBulkValueChange,
  onBulkSubmit,
  onLoadSiswa
}) => {
  const [selectedMapel, setSelectedMapel] = React.useState('');
  const [selectedKelas, setSelectedKelas] = React.useState('');
  const [selectedJenisNilai, setSelectedJenisNilai] = React.useState('');
  const [judulTugas, setJudulTugas] = React.useState('');
  const [tanggalTugasDibuat, setTanggalTugasDibuat] = React.useState(new Date().toISOString().split('T')[0]);

  // state for popup profil siswa
  const [profilOpen, setProfilOpen] = React.useState(false);
  const [selectedSiswa, setSelectedSiswa] = React.useState<Siswa | null>(null);

  const handleKelasChange = (value: string) => {
    setSelectedKelas(value);
    if (value && value !== '') {
      onLoadSiswa(value);
    }
  };

  const handleBulkValueChange = (siswaId: string, field: 'skor' | 'catatan', value: string) => {
    const currentEntry = bulkValues[siswaId] || { id_siswa: siswaId, skor: 0, catatan: '' };
    const updatedEntry = {
      ...currentEntry,
      [field]: field === 'skor' ? parseFloat(value) || 0 : value
    };
    onBulkValueChange(siswaId, updatedEntry);
  };

  const handleSubmit = async () => {
    if (!selectedMapel || !selectedJenisNilai || !judulTugas) {
      return;
    }
    await onBulkSubmit(selectedMapel, selectedJenisNilai, judulTugas, tanggalTugasDibuat);
  };

  const canShowTable = selectedMapel && selectedKelas && selectedJenisNilai && judulTugas && siswaList.length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Entry Nilai Massal - Mode Excel</CardTitle>
          <p className="text-sm text-gray-600">
            Pilih mata pelajaran, kelas, masukkan judul tugas, dan nilai untuk setiap siswa
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
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
              <Select value={selectedKelas} onValueChange={handleKelasChange}>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Judul Tugas *</label>
              <Input
                value={judulTugas}
                onChange={(e) => setJudulTugas(e.target.value)}
                placeholder="Masukkan judul tugas"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tanggal Tugas Dibuat</label>
              <Input
                type="date"
                value={tanggalTugasDibuat}
                onChange={(e) => setTanggalTugasDibuat(e.target.value)}
              />
            </div>
          </div>

          {canShowTable && (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">No</TableHead>
                      <TableHead className="w-16 text-center">Foto</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead className="w-24">Nilai (0-100)</TableHead>
                      <TableHead className="w-48">Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {siswaList.map((siswa, index) => (
                      <TableRow key={siswa.id_siswa}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="text-center">
                          <div
                            className="inline-block cursor-pointer"
                            onClick={() => {
                              setSelectedSiswa(siswa);
                              setProfilOpen(true);
                            }}
                            title="Lihat profil siswa"
                          >
                            {/* ONLY pass expected props! */}
                            <StudentAvatarCell siswa={{
                              nama_lengkap: siswa.nama_lengkap,
                              foto_url: siswa.foto_url
                            }} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            className="text-left hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => {
                              setSelectedSiswa(siswa);
                              setProfilOpen(true);
                            }}
                          >
                            {siswa.nama_lengkap}
                          </button>
                          <div className="text-xs text-gray-500 mt-0.5">{siswa.nisn}</div>
                        </TableCell>
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
                          <Textarea
                            value={bulkValues[siswa.id_siswa]?.catatan || ''}
                            onChange={(e) => handleBulkValueChange(siswa.id_siswa, 'catatan', e.target.value)}
                            placeholder="Catatan (opsional)"
                            className="w-full min-h-[40px] resize-none"
                            rows={2}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit} 
                  className="flex items-center gap-2"
                  disabled={!judulTugas || !selectedMapel || !selectedJenisNilai}
                >
                  <Save className="h-4 w-4" />
                  Simpan Semua Nilai
                </Button>
              </div>
            </>
          )}

          {selectedMapel && selectedKelas && selectedJenisNilai && !judulTugas && (
            <div className="text-center py-8 text-gray-500">
              Masukkan judul tugas untuk melanjutkan
            </div>
          )}

          {selectedMapel && selectedKelas && selectedJenisNilai && judulTugas && siswaList.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada siswa di kelas yang dipilih
            </div>
          )}
        </CardContent>
      </Card>
      <ProfilSiswaPopup
        siswa={selectedSiswa ? {
          id_siswa: selectedSiswa.id_siswa,
          nisn: selectedSiswa.nisn,
          nama_lengkap: selectedSiswa.nama_lengkap,
          jenis_kelamin: selectedSiswa.jenis_kelamin || "",
          tanggal_lahir: (selectedSiswa as any).tanggal_lahir || "",
          tempat_lahir: (selectedSiswa as any).tempat_lahir || "",
          alamat: (selectedSiswa as any).alamat || "",
          nomor_telepon: (selectedSiswa as any).nomor_telepon || "",
          nomor_telepon_siswa: (selectedSiswa as any).nomor_telepon_siswa || "",
          nama_orang_tua: (selectedSiswa as any).nama_orang_tua || "",
          nomor_telepon_orang_tua: (selectedSiswa as any).nomor_telepon_orang_tua || "",
          tahun_masuk: (selectedSiswa as any).tahun_masuk || 0,
          foto_url: selectedSiswa.foto_url,
          kelas: (selectedSiswa as any).kelas || undefined,
          guru_wali: (selectedSiswa as any).guru_wali || undefined,
        } : null}
        isOpen={profilOpen}
        onClose={() => { setProfilOpen(false); setSelectedSiswa(null); }}
      />
    </>
  );
};

export default BulkNilaiEntry;
