
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfilSiswaPopup from '../ProfilSiswaPopup';
import BulkNilaiHeadForm from './BulkNilaiHeadForm';
import BulkNilaiTable from './BulkNilaiTable';

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
  tanggal_lahir?: string;
  tempat_lahir?: string;
  alamat?: string;
  nomor_telepon?: string;
  nomor_telepon_siswa?: string;
  nama_orang_tua?: string;
  nomor_telepon_orang_tua?: string;
  tahun_masuk?: number;
  kelas?: any;
  guru_wali?: any;
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

  // Gabungkan properti detail untuk profil siswa, tambahkan default value agar selalu sesuai type yang dibutuhkan
  const getSelectedSiswaFull = (siswa: Siswa | null): Siswa | null => {
    if (!siswa) return null;
    return {
      id_siswa: siswa.id_siswa,
      nisn: siswa.nisn,
      nama_lengkap: siswa.nama_lengkap,
      jenis_kelamin: siswa.jenis_kelamin || "",
      tanggal_lahir: (siswa as any).tanggal_lahir || "",
      tempat_lahir: (siswa as any).tempat_lahir || "",
      alamat: (siswa as any).alamat || "",
      nomor_telepon: (siswa as any).nomor_telepon || "",
      nomor_telepon_siswa: (siswa as any).nomor_telepon_siswa || "",
      nama_orang_tua: (siswa as any).nama_orang_tua || "",
      nomor_telepon_orang_tua: (siswa as any).nomor_telepon_orang_tua || "",
      tahun_masuk: (siswa as any).tahun_masuk || 0,
      foto_url: siswa.foto_url,
      kelas: (siswa as any).kelas || undefined,
      guru_wali: (siswa as any).guru_wali || undefined
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
            canShowTable={canShowTable}
            onSiswaClick={(siswa) => {
              setSelectedSiswa(siswa);
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
        siswa={getSelectedSiswaFull(selectedSiswa)}
        isOpen={profilOpen}
        onClose={() => { setProfilOpen(false); setSelectedSiswa(null); }}
      />
    </>
  );
};

export default BulkNilaiEntry;
