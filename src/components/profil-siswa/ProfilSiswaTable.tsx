
import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, ArrowUpAZ, ArrowDownAZ } from "lucide-react";

interface Siswa {
  id_siswa: string;
  nisn: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  nomor_telepon?: string;
  nomor_telepon_siswa?: string;
  nama_orang_tua: string;
  nomor_telepon_orang_tua?: string;
  tahun_masuk: number;
  foto_url?: string;
  kelas: {
    nama_kelas: string;
  };
  guru_wali: {
    nama_lengkap: string;
  };
}
interface ProfilSiswaTableProps {
  siswaList: Siswa[];
  loading: boolean;
  calculateAge: (birthDate: string) => number;
  handleSiswaClick: (siswa: Siswa) => void;
}

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const ProfilSiswaTable: React.FC<ProfilSiswaTableProps> = ({
  siswaList,
  loading,
  calculateAge,
  handleSiswaClick,
}) => {
  const [sortAscending, setSortAscending] = useState(true);

  const sortedSiswaList = useMemo(() => {
    return [...siswaList].sort((a, b) => {
      const comparison = a.nama_lengkap.localeCompare(b.nama_lengkap, 'id', { 
        sensitivity: 'base' 
      });
      return sortAscending ? comparison : -comparison;
    });
  }, [siswaList, sortAscending]);

  const toggleSort = () => {
    setSortAscending(!sortAscending);
  };

  return (
    <div
      className="overflow-x-auto scrollbar-thin"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center gap-2">
                <span>Profil</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSort}
                  className="h-6 w-6 p-0"
                >
                  {sortAscending ? (
                    <ArrowUpAZ className="h-4 w-4" />
                  ) : (
                    <ArrowDownAZ className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TableHead>
            <TableHead>Kelas</TableHead>
            <TableHead>Jenis Kelamin</TableHead>
            <TableHead>Umur</TableHead>
            <TableHead>No. Telepon Siswa</TableHead>
            <TableHead>Alamat</TableHead>
            <TableHead>Tempat Lahir</TableHead>
            <TableHead>Orang Tua</TableHead>
            <TableHead>Wali Kelas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9}>
                <div className="text-center py-8">Memuat data...</div>
              </TableCell>
            </TableRow>
          ) : siswaList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9}>
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data siswa ditemukan
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sortedSiswaList.map((siswa) => (
              <TableRow key={siswa.id_siswa}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleSiswaClick(siswa)}
                    >
                      <AvatarImage src={siswa.foto_url} alt={siswa.nama_lengkap} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(siswa.nama_lengkap)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleSiswaClick(siswa)}
                      >
                        {siswa.nama_lengkap}
                      </div>
                      <div className="text-sm text-gray-500">{siswa.nisn}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{siswa.kelas.nama_kelas}</TableCell>
                <TableCell>
                  <Badge variant={siswa.jenis_kelamin === 'Laki-laki' ? 'default' : 'secondary'}>
                    {siswa.jenis_kelamin}
                  </Badge>
                </TableCell>
                <TableCell>{calculateAge(siswa.tanggal_lahir)} tahun</TableCell>
                <TableCell>
                  {(siswa.nomor_telepon_siswa || siswa.nomor_telepon) ? (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{siswa.nomor_telepon_siswa || siswa.nomor_telepon}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm">{siswa.alamat}</div>
                </TableCell>
                <TableCell>{siswa.tempat_lahir}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{siswa.nama_orang_tua}</div>
                    {siswa.nomor_telepon_orang_tua && (
                      <div className="text-sm text-gray-500">{siswa.nomor_telepon_orang_tua}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{siswa.guru_wali.nama_lengkap}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProfilSiswaTable;
