
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import ProfilSiswaPopup from '../ProfilSiswaPopup';

interface Nilai {
  id_nilai: string;
  jenis_nilai: string;
  skor: number;
  tanggal_nilai: string;
  catatan?: string;
  siswa: {
    id_siswa: string;
    nama_lengkap: string;
    nisn: string;
    jenis_kelamin: string;
    tanggal_lahir: string;
    tempat_lahir: string;
    alamat: string;
    nomor_telepon?: string;
    nama_orang_tua: string;
    nomor_telepon_orang_tua?: string;
    tahun_masuk: number;
    foto_url?: string;
    kelas?: {
      nama_kelas: string;
    };
    guru_wali?: {
      nama_lengkap: string;
    };
  };
  mata_pelajaran: {
    nama_mapel: string;
  };
}

interface NilaiOverviewTableProps {
  filteredNilai: Nilai[];
  loading: boolean;
}

interface StudentGrades {
  siswa: Nilai['siswa'];
  grades: { [jenisNilai: string]: number };
  average: number;
}

const NilaiOverviewTable: React.FC<NilaiOverviewTableProps> = ({ filteredNilai, loading }) => {
  const [selectedSiswa, setSelectedSiswa] = useState<Nilai['siswa'] | null>(null);
  const [isProfilOpen, setIsProfilOpen] = useState(false);

  // Group nilai by student and calculate averages
  const studentGradesData = useMemo(() => {
    const grouped: { [siswaId: string]: StudentGrades } = {};

    filteredNilai.forEach(nilai => {
      const siswaId = nilai.siswa.id_siswa;
      
      if (!grouped[siswaId]) {
        grouped[siswaId] = {
          siswa: nilai.siswa,
          grades: {},
          average: 0
        };
      }

      // Store grade by jenis_nilai, if multiple grades exist for same type, take the latest one
      grouped[siswaId].grades[nilai.jenis_nilai] = nilai.skor;
    });

    // Calculate averages
    Object.values(grouped).forEach(studentData => {
      const grades = Object.values(studentData.grades);
      studentData.average = grades.length > 0 
        ? Math.round((grades.reduce((sum, grade) => sum + grade, 0) / grades.length) * 100) / 100
        : 0;
    });

    return Object.values(grouped).sort((a, b) => a.siswa.nama_lengkap.localeCompare(b.siswa.nama_lengkap));
  }, [filteredNilai]);

  // Get all unique jenis nilai for table headers
  const jenisNilaiList = useMemo(() => {
    const jenisSet = new Set<string>();
    filteredNilai.forEach(nilai => jenisSet.add(nilai.jenis_nilai));
    return Array.from(jenisSet).sort();
  }, [filteredNilai]);

  const handleSiswaClick = (siswa: Nilai['siswa']) => {
    setSelectedSiswa(siswa);
    setIsProfilOpen(true);
  };

  const getScoreColor = (skor: number) => {
    if (skor >= 85) return 'bg-green-100 text-green-800';
    if (skor >= 75) return 'bg-blue-100 text-blue-800';
    if (skor >= 65) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi Nilai Siswa</CardTitle>
          <p className="text-sm text-gray-600">
            Klik nama siswa atau ikon untuk melihat profil lengkap
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead className="w-16"></TableHead>
                    <TableHead className="min-w-48">Nama Siswa</TableHead>
                    {jenisNilaiList.map((jenisNilai) => (
                      <TableHead key={jenisNilai} className="text-center min-w-24">
                        {jenisNilai}
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-24 font-semibold">Rata-rata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentGradesData.map((studentData, index) => (
                    <TableRow key={studentData.siswa.id_siswa} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSiswaClick(studentData.siswa)}
                          className="p-1 h-8 w-8"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleSiswaClick(studentData.siswa)}
                          className="text-left hover:text-blue-600 hover:underline transition-colors"
                        >
                          <div className="font-medium">{studentData.siswa.nama_lengkap}</div>
                          <div className="text-sm text-gray-500">{studentData.siswa.nisn}</div>
                        </button>
                      </TableCell>
                      {jenisNilaiList.map((jenisNilai) => (
                        <TableCell key={jenisNilai} className="text-center">
                          {studentData.grades[jenisNilai] !== undefined ? (
                            <Badge className={getScoreColor(studentData.grades[jenisNilai])}>
                              {studentData.grades[jenisNilai]}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center">
                        {studentData.average > 0 ? (
                          <Badge 
                            variant="outline" 
                            className={`font-semibold ${getScoreColor(studentData.average)}`}
                          >
                            {studentData.average}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!loading && studentGradesData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada data nilai sesuai filter
            </div>
          )}
        </CardContent>
      </Card>

      <ProfilSiswaPopup
        siswa={selectedSiswa}
        isOpen={isProfilOpen}
        onClose={() => {
          setIsProfilOpen(false);
          setSelectedSiswa(null);
        }}
      />
    </>
  );
};

export default NilaiOverviewTable;
