
import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface BulkNilaiHeadFormProps {
  mapelList: MataPelajaran[];
  kelasList: Kelas[];
  selectedMapel: string;
  setSelectedMapel: (value: string) => void;
  selectedKelas: string;
  handleKelasChange: (value: string) => void;
  selectedJenisNilai: string;
  setSelectedJenisNilai: (value: string) => void;
  judulTugas: string;
  setJudulTugas: (value: string) => void;
  tanggalTugasDibuat: string;
  setTanggalTugasDibuat: (value: string) => void;
}

const BulkNilaiHeadForm: React.FC<BulkNilaiHeadFormProps> = ({
  mapelList,
  kelasList,
  selectedMapel,
  setSelectedMapel,
  selectedKelas,
  handleKelasChange,
  selectedJenisNilai,
  setSelectedJenisNilai,
  judulTugas,
  setJudulTugas,
  tanggalTugasDibuat,
  setTanggalTugasDibuat,
}) => (
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
);

export default BulkNilaiHeadForm;
