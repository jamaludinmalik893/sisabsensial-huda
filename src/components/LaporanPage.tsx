
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserSession } from '@/types';
import { useGuruMataPelajaran } from '@/hooks/useGuruMataPelajaran';
import { getSemesterOptions, getCurrentSemester } from '@/types/semester';
import LaporanKehadiran from './laporan/LaporanKehadiran';
import LaporanNilai from './laporan/LaporanNilai';
import LaporanGabungan from './laporan/LaporanGabungan';
import ProfilSiswaPopup from './ProfilSiswaPopup';
import { FileText, Filter } from 'lucide-react';

interface LaporanPageProps {
  userSession: UserSession;
}

const LaporanPage: React.FC<LaporanPageProps> = ({ userSession }) => {
  const currentSemester = getCurrentSemester();
  const [selectedPeriode, setSelectedPeriode] = useState('bulanan');
  const [selectedSemester, setSelectedSemester] = useState(`${currentSemester.semester}-${currentSemester.tahun}`);
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('all');
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [selectedSiswa, setSelectedSiswa] = useState('all');

  // Student profile popup state
  const [selectedSiswaForPopup, setSelectedSiswaForPopup] = useState<any>(null);
  const [isProfilOpen, setIsProfilOpen] = useState(false);

  // Fetch mata pelajaran yang diampu guru
  const { mataPelajaran, loading: loadingMapel } = useGuruMataPelajaran(userSession.guru.id_guru);

  const semesterOptions = getSemesterOptions();

  const handleSiswaClick = (siswa: any) => {
    setSelectedSiswaForPopup(siswa);
    setIsProfilOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan Akademik</h1>
          <p className="text-gray-600">Statistik kehadiran, nilai, dan gabungan per semester</p>
        </div>
      </div>

      {/* Filter Global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Semester</SelectItem>
                  {semesterOptions.map((option) => (
                    <SelectItem key={`${option.semester}-${option.tahun}`} value={`${option.semester}-${option.tahun}`}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="periode">Periode</Label>
              <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
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
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="tanggal-akhir">Tanggal Akhir</Label>
              <Input
                type="date"
                value={tanggalAkhir}
                onChange={(e) => setTanggalAkhir(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="kelas">Kelas</Label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  <SelectItem value="X-RPL-1">X RPL 1</SelectItem>
                  <SelectItem value="X-RPL-2">X RPL 2</SelectItem>
                  <SelectItem value="XI-RPL-1">XI RPL 1</SelectItem>
                  <SelectItem value="XII-RPL-1">XII RPL 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mapel">Mata Pelajaran</Label>
              <Select value={selectedMapel} onValueChange={setSelectedMapel} disabled={loadingMapel}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingMapel ? "Memuat..." : "Pilih Mapel"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mapel</SelectItem>
                  {mataPelajaran.map((mapel) => (
                    <SelectItem key={mapel.id_mapel} value={mapel.id_mapel}>
                      {mapel.nama_mapel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="siswa">Siswa</Label>
              <Select value={selectedSiswa} onValueChange={setSelectedSiswa}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Siswa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Siswa</SelectItem>
                  <SelectItem value="individu">Pilih Individu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs untuk jenis laporan */}
      <Tabs defaultValue="kehadiran" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kehadiran">Laporan Kehadiran</TabsTrigger>
          <TabsTrigger value="nilai">Laporan Nilai</TabsTrigger>
          <TabsTrigger value="gabungan">Laporan Gabungan</TabsTrigger>
        </TabsList>

        <TabsContent value="kehadiran">
          <LaporanKehadiran 
            userSession={userSession}
            filters={{
              periode: selectedPeriode,
              tanggalMulai,
              tanggalAkhir,
              kelas: selectedKelas,
              mapel: selectedMapel,
              siswa: selectedSiswa,
              semester: selectedSemester
            }}
            onSiswaClick={handleSiswaClick}
          />
        </TabsContent>

        <TabsContent value="nilai">
          <LaporanNilai 
            userSession={userSession}
            filters={{
              periode: selectedPeriode,
              tanggalMulai,
              tanggalAkhir,
              kelas: selectedKelas,
              mapel: selectedMapel,
              siswa: selectedSiswa,
              semester: selectedSemester
            }}
            onSiswaClick={handleSiswaClick}
          />
        </TabsContent>

        <TabsContent value="gabungan">
          <LaporanGabungan 
            userSession={userSession}
            filters={{
              periode: selectedPeriode,
              tanggalMulai,
              tanggalAkhir,
              kelas: selectedKelas,
              mapel: selectedMapel,
              siswa: selectedSiswa,
              semester: selectedSemester
            }}
            onSiswaClick={handleSiswaClick}
          />
        </TabsContent>
      </Tabs>

      {/* Student Profile Popup */}
      <ProfilSiswaPopup
        siswa={selectedSiswaForPopup}
        isOpen={isProfilOpen}
        onClose={() => {
          setIsProfilOpen(false);
          setSelectedSiswaForPopup(null);
        }}
      />
    </div>
  );
};

export default LaporanPage;
