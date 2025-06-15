import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfilSiswaPopup from '../ProfilSiswaPopup';
import BulkNilaiHeadForm from './BulkNilaiHeadForm';
import BulkNilaiTable from './BulkNilaiTable';
import type { Siswa, MataPelajaran, Kelas } from '@/types/index';
import { convertSiswaToFullSiswa } from "./convertSiswaToFullSiswa";

// Tipe Data Entry Nilai
export interface BulkNilaiEntry {
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
  // Ubah: type menjadi lengkap memakai hasil konversi
  const [selectedSiswa, setSelectedSiswa] = React.useState<Siswa | null>(null);

  const handleKelasChange = (value: string) => {
    setSelectedKelas(value);
    if (value && value !== '') {
      onLoadSiswa(value);
    }
  };

  const handleBulkValueChange = (siswaId: string, entry: BulkNilaiEntry) => {
    onBulkValueChange(siswaId, entry);
  };

  const handleSubmit = async () => {
    if (!selectedMapel || !selectedJenisNilai || !judulTugas) {
      return;
    }
    await onBulkSubmit(selectedMapel, selectedJenisNilai, judulTugas, tanggalTugasDibuat);
  };

  const canShowTable = selectedMapel && selectedKelas && selectedJenisNilai && judulTugas && siswaList.length > 0;

  // Perbaikan handle klik pada avatar/nama siswa agar data selalu lengkap ke popup
  // dan pastikan field foto_url dsb. akan dikirim (convertSiswaToFullSiswa sudah menjamin field lengkap)
  const handleSiswaClick = (siswa: Siswa) => {
    const lengkap = convertSiswaToFullSiswa(siswa);
    setSelectedSiswa(lengkap);
    setProfilOpen(true);
  };

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
          <BulkNilaiHeadForm
            mapelList={mapelList}
            kelasList={kelasList}
            selectedMapel={selectedMapel}
            setSelectedMapel={setSelectedMapel}
            selectedKelas={selectedKelas}
            handleKelasChange={handleKelasChange}
            selectedJenisNilai={selectedJenisNilai}
            setSelectedJenisNilai={setSelectedJenisNilai}
            judulTugas={judulTugas}
            setJudulTugas={setJudulTugas}
            tanggalTugasDibuat={tanggalTugasDibuat}
            setTanggalTugasDibuat={setTanggalTugasDibuat}
          />

          <BulkNilaiTable
            siswaList={siswaList.map(s => convertSiswaToFullSiswa(s))}
            bulkValues={bulkValues}
            onBulkValueChange={handleBulkValueChange}
            canShowTable={!!canShowTable}
            onSiswaClick={handleSiswaClick}
            onSubmit={handleSubmit}
            judulTugas={judulTugas}
            selectedMapel={selectedMapel}
            selectedJenisNilai={selectedJenisNilai}
          />

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
        siswa={selectedSiswa}
        isOpen={profilOpen}
        onClose={() => { setProfilOpen(false); setSelectedSiswa(null); }}
      />
    </>
  );
};

export default BulkNilaiEntry;
