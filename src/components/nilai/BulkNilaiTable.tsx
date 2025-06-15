
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import StudentAvatarCell from "./StudentAvatarCell";
import ProfilSiswaPopup from "../ProfilSiswaPopup";

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

export interface BulkNilaiEntry {
  id_siswa: string;
  skor: number;
  catatan: string;
}

interface BulkNilaiTableProps {
  siswaList: Siswa[];
  bulkValues: Record<string, BulkNilaiEntry>;
  onBulkValueChange: (siswaId: string, entry: BulkNilaiEntry) => void;
  canShowTable: boolean;
  onSiswaClick: (siswa: Siswa) => void;
  onSubmit: () => void;
  judulTugas: string;
  selectedMapel: string;
  selectedJenisNilai: string;
}

const BulkNilaiTable: React.FC<BulkNilaiTableProps> = ({
  siswaList,
  bulkValues,
  onBulkValueChange,
  canShowTable,
  onSiswaClick,
  onSubmit,
  judulTugas,
  selectedMapel,
  selectedJenisNilai,
}) => {
  if (!canShowTable) return null;

  return (
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
                    onClick={() => onSiswaClick(siswa)}
                    title="Lihat profil siswa"
                  >
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
                    onClick={() => onSiswaClick(siswa)}
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
                    value={bulkValues[siswa.id_siswa]?.skor ?? ''}
                    onChange={(e) =>
                      onBulkValueChange(siswa.id_siswa, {
                        ...bulkValues[siswa.id_siswa],
                        id_siswa: siswa.id_siswa,
                        skor: Number(e.target.value),
                        catatan: bulkValues[siswa.id_siswa]?.catatan || ""
                      })
                    }
                    placeholder="0-100"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    value={bulkValues[siswa.id_siswa]?.catatan ?? ""}
                    onChange={(e) =>
                      onBulkValueChange(siswa.id_siswa, {
                        ...bulkValues[siswa.id_siswa],
                        id_siswa: siswa.id_siswa,
                        skor: bulkValues[siswa.id_siswa]?.skor ?? 0,
                        catatan: e.target.value
                      })
                    }
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
          onClick={onSubmit}
          className="flex items-center gap-2"
          disabled={!judulTugas || !selectedMapel || !selectedJenisNilai}
        >
          <Save className="h-4 w-4" />
          Simpan Semua Nilai
        </Button>
      </div>
    </>
  );
};

export default BulkNilaiTable;
