
// DAFTAR IMPORTS
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfilSiswaPopup from '../ProfilSiswaPopup';
import BulkNilaiHeadForm from './BulkNilaiHeadForm';
import BulkNilaiTable from './BulkNilaiTable';
import type { Siswa, MataPelajaran, Kelas } from '@/types/index';

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

  // Konstruksi data sesuai tipe Siswa
  const getSelectedSiswaFull = (siswa: Siswa | null): Siswa | null => {
    if (!siswa) return null;
    // Pastikan semua properti wajib ada
    return {
      id_siswa: siswa.id_siswa,
      nisn: siswa.nisn,
      nama_lengkap: siswa.nama_lengkap,
      jenis_kelamin: siswa.jenis_kelamin ?? '',
      tanggal_lahir: siswa.tanggal_lahir ?? '',
      tempat_lahir: siswa.tempat_lahir ?? '',
      alamat: siswa.alamat ?? '',
      nomor_telepon: siswa.nomor_telepon ?? '',
      nama_orang_tua: siswa.nama_orang_tua ?? '',
      nomor_telepon_orang_tua: siswa.nomor_telepon_orang_tua ?? '',
      id_kelas: siswa.id_kelas ?? '',
      id_guru_wali: siswa.id_guru_wali ?? '',
      tahun_masuk: siswa.tahun_masuk ?? 0,
      foto_url: siswa.foto_url,
      created_at: siswa.created_at,
      updated_at: siswa.updated_at,
      kelas: siswa.kelas,
      guru_wali: siswa.guru_wali,
      nomor_telepon_siswa: (siswa as any).nomor_telepon_siswa ?? '',
    };
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
            siswaList={siswaList}
            bulkValues={bulkValues}
            onBulkValueChange={handleBulkValueChange}
            canShowTable={!!canShowTable}
            onSiswaClick={(siswa) => {
              // isi semua properti sesuai type
              setSelectedSiswa(getSelectedSiswaFull(siswa));
              setProfilOpen(true);
            }}
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
        siswa={selectedSiswa ? getSelectedSiswaFull(selectedSiswa) : null}
        isOpen={profilOpen}
        onClose={() => { setProfilOpen(false); setSelectedSiswa(null); }}
      />
    </>
  );
};

export default BulkNilaiEntry;
