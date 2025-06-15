import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StudentCell from './StudentCell';
import NilaiDisplayCell from './NilaiDisplayCell';
import ProfilSiswaPopup from '../ProfilSiswaPopup';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import EditNilaiDialog from './EditNilaiDialog';
import StudentAvatarCell from './StudentAvatarCell';
import NilaiTableRow from "./NilaiTableRow";
import DeleteNilaiDialog from "./DeleteNilaiDialog";

interface Nilai {
  id_nilai: string;
  jenis_nilai: string;
  judul_tugas: string;
  tanggal_tugas_dibuat: string;
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
  selectedMapel: string;
  selectedKelas: string;
  mapelList: Array<{id_mapel: string; nama_mapel: string}>;
  kelasList: Array<{id_kelas: string; nama_kelas: string}>;
  onUpdateNilai: (nilaiId: string, newSkor: number, newCatatan: string) => Promise<void>;
  deleteNilai: (nilaiId: string) => Promise<void>;
}

interface StudentGrades {
  siswa: Nilai['siswa'];
  grades: { [taskKey: string]: {skor: number; tanggal: string; catatan?: string; id_nilai: string; judul_tugas: string} };
  average: number;
}

const NilaiOverviewTable: React.FC<NilaiOverviewTableProps> = ({
  filteredNilai,
  loading,
  selectedMapel,
  selectedKelas,
  mapelList,
  kelasList,
  onUpdateNilai,
  deleteNilai
}) => {
  // DEBUG: log apa yang diterima di filteredNilai (harusnya sama seperti nilaiList)
  console.log("NilaiOverviewTable filteredNilai:", filteredNilai);

  const [selectedSiswa, setSelectedSiswa] = useState<Nilai['siswa'] | null>(null);
  const [isProfilOpen, setIsProfilOpen] = useState(false);

  // State for editing popup
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    nilaiId: string | null;
    initialSkor: number | "";
    initialCatatan: string;
    siswaName: string;
    judulTugas: string;
    onSave?: () => void;
  }>({ open: false, nilaiId: null, initialSkor: "", initialCatatan: "", siswaName: "", judulTugas: "" });

  // State untuk delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    nilaiId: string | null;
    siswaName: string;
    judulTugas: string;
  }>({ open: false, nilaiId: null, siswaName: "", judulTugas: "" });

  // Filter nilai by selected subject and class
  const relevantNilai = useMemo(() => {
    return filteredNilai.filter(nilai => {
      const matchMapel = selectedMapel === 'all' || nilai.mata_pelajaran.nama_mapel === mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
      const matchKelas = selectedKelas === 'all' || nilai.siswa.kelas?.nama_kelas === kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
      return matchMapel && matchKelas;
    });
  }, [filteredNilai, selectedMapel, selectedKelas, mapelList, kelasList]);

  // Group nilai by student and task
  const studentGradesData = useMemo(() => {
    const grouped: { [siswaId: string]: StudentGrades } = {};

    relevantNilai.forEach(nilai => {
      const siswaId = nilai.siswa.id_siswa;
      const taskKey = `${nilai.judul_tugas}`;
      
      if (!grouped[siswaId]) {
        grouped[siswaId] = {
          siswa: nilai.siswa,
          grades: {},
          average: 0
        };
      }

      // Store grade by task, if multiple grades exist for same task, take the latest one
      if (!grouped[siswaId].grades[taskKey] || new Date(nilai.tanggal_nilai) > new Date(grouped[siswaId].grades[taskKey].tanggal)) {
        grouped[siswaId].grades[taskKey] = {
          skor: nilai.skor,
          tanggal: nilai.tanggal_tugas_dibuat,
          catatan: nilai.catatan,
          id_nilai: nilai.id_nilai,
          judul_tugas: nilai.judul_tugas
        };
      }
    });

    // Calculate averages
    Object.values(grouped).forEach(studentData => {
      const grades = Object.values(studentData.grades).map(g => g.skor);
      studentData.average = grades.length > 0 
        ? Math.round((grades.reduce((sum, grade) => sum + grade, 0) / grades.length) * 100) / 100
        : 0;
    });

    return Object.values(grouped).sort((a, b) => a.siswa.nama_lengkap.localeCompare(b.siswa.nama_lengkap));
  }, [relevantNilai]);

  // Get all unique tasks for table headers
  const taskList = useMemo(() => {
    const taskSet = new Set<string>();
    const taskDates: { [key: string]: string } = {};
    
    relevantNilai.forEach(nilai => {
      const taskKey = `${nilai.judul_tugas}`;
      taskSet.add(taskKey);
      taskDates[taskKey] = nilai.tanggal_tugas_dibuat;
    });
    
    return Array.from(taskSet).sort().map(task => ({
      name: task,
      date: taskDates[task]
    }));
  }, [relevantNilai]);

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

  const getSelectedInfo = () => {
    const mapelName = selectedMapel === 'all' ? 'Semua Mata Pelajaran' : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
    const kelasName = selectedKelas === 'all' ? 'Semua Kelas' : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
    return `${mapelName} - ${kelasName}`;
  };

  // Open dialog popup for editing grade/catatan
  const openEditDialog = (nilaiId: string, skor: number, catatan: string, siswaName: string, judulTugas: string) => {
    setEditDialog({
      open: true,
      nilaiId,
      initialSkor: skor,
      initialCatatan: catatan,
      siswaName,
      judulTugas,
    });
  };

  // Simpan setelah edit dari dialog
  const handleSaveEdit = async (skorBaru: number, catatanBaru: string) => {
    if (!editDialog.nilaiId) return;
    await onUpdateNilai(editDialog.nilaiId, skorBaru, catatanBaru);
    setEditDialog({ ...editDialog, open: false });
  };

  // open action menu for edit/hapus
  const openTaskActionsDialog = (
    nilaiId: string,
    siswaName: string,
    judulTugas: string
  ) => {
    setDeleteDialog({ open: true, nilaiId, siswaName, judulTugas });
  };

  // Handler klik hapus pada dialog
  const handleDeleteNilai = async () => {
    if (!deleteDialog.nilaiId) return;
    if (typeof deleteNilai === "function") {
      await deleteNilai(deleteDialog.nilaiId);
    }
    setDeleteDialog({ ...deleteDialog, open: false });
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi Nilai Siswa</CardTitle>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-600">
              {getSelectedInfo()}
            </p>
            <p className="text-xs text-gray-500">
              Klik <b>foto atau nama siswa</b> untuk melihat profil lengkap. <b>Double klik</b> pada nilai/tugas untuk mengubah nilai/catatan.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* No Absen */}
                    <TableHead className="w-12 text-center">No Absen</TableHead>
                    <TableHead className="min-w-40">Nama Siswa</TableHead>
                    {/* Move all task columns before Rata-rata */}
                    {taskList.map((task) => (
                      <TableHead key={task.name} className="text-center min-w-24">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{task.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(task.date).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
                        </div>
                      </TableHead>
                    ))}
                    {/* Move Rata-rata to far right */}
                    <TableHead className="min-w-24 text-center">
                      Rekapitulasi<br /><span className="font-light">(Rata-rata)</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentGradesData.map((studentData, idx) => (
                    <TableRow key={studentData.siswa.id_siswa} className="hover:bg-gray-50 group">
                      {/* No Absen */}
                      <TableCell className="p-2 text-center align-middle">{idx + 1}</TableCell>
                      {/* Nama Siswa */}
                      <TableCell className="p-2 align-middle">
                        <StudentCell
                          siswa={studentData.siswa}
                          onClickProfil={handleSiswaClick}
                        />
                      </TableCell>
                      {/* Task/score columns */}
                      {taskList.map((task) => {
                        const grade = studentData.grades[task.name];
                        return (
                          <TableCell key={task.name} className="text-center p-2 align-middle">
                            {grade !== undefined ? (
                              <div
                                onDoubleClick={() =>
                                  openEditDialog(
                                    grade.id_nilai,
                                    grade.skor,
                                    grade.catatan ?? "",
                                    studentData.siswa.nama_lengkap,
                                    grade.judul_tugas
                                  )
                                }
                                className="inline-block cursor-pointer group relative"
                                title="Double klik untuk edit nilai & catatan"
                              >
                                <Badge className={`text-xs ${getScoreColor(grade.skor)} relative`}>
                                  {grade.skor}
                                  {grade.catatan && (
                                    <span className="absolute top-[-3px] right-[-3px]">
                                      <span className="inline-block h-2 w-2 rounded-full bg-green-500 border-2 border-white shadow" />
                                    </span>
                                  )}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      {/* Rekapitulasi (average) at the far right */}
                      <TableCell className="p-2 text-center align-middle">
                        {studentData.average > 0 ? (
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold ${getScoreColor(studentData.average)}`}
                          >
                            {studentData.average}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </TableCell>
                      {/* Kolom Judul Tugas (double click for edit/delete) */}
                      {Object.values(studentData.grades).map((grade, i) => (
                        <React.Fragment key={i + "-extra"}>
                          <TableCell
                            className="text-center p-2 align-middle cursor-pointer"
                            onDoubleClick={() =>
                              openTaskActionsDialog(
                                grade.id_nilai,
                                studentData.siswa.nama_lengkap,
                                grade.judul_tugas
                              )
                            }
                            title="Double klik untuk edit/hapus nilai"
                          >
                            {grade.judul_tugas}
                          </TableCell>
                          <TableCell
                            className="text-center p-2 align-middle cursor-pointer"
                            onDoubleClick={() =>
                              openTaskActionsDialog(
                                grade.id_nilai,
                                studentData.siswa.nama_lengkap,
                                grade.judul_tugas
                              )
                            }
                            title="Double klik untuk edit/hapus nilai"
                          >
                            {grade.tanggal ? new Date(grade.tanggal).toLocaleDateString('id-ID') : "-"}
                          </TableCell>
                        </React.Fragment>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && studentGradesData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada data nilai sesuai filter yang dipilih
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
      {/* Dialog untuk edit nilai/catatan */}
      <EditNilaiDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
        initialSkor={editDialog.initialSkor}
        initialCatatan={editDialog.initialCatatan}
        onSave={handleSaveEdit}
        namaSiswa={editDialog.siswaName}
        judulTugas={editDialog.judulTugas}
      />
      <DeleteNilaiDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={handleDeleteNilai}
        namaSiswa={deleteDialog.siswaName}
        judulTugas={deleteDialog.judulTugas}
      />
    </TooltipProvider>
  );
};

export type { Nilai };
export default NilaiOverviewTable;
