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
import TaskHeaderActionsDialog from "./TaskHeaderActionsDialog";
import NilaiFilters from "./NilaiFilters";
import { Edit, Trash2 } from "lucide-react";

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
  selectedMapel: defaultSelectedMapel,
  selectedKelas: defaultSelectedKelas,
  mapelList,
  kelasList,
  onUpdateNilai,
  deleteNilai
}) => {
  // FILTER STATES
  const [selectedMapel, setSelectedMapel] = useState(defaultSelectedMapel || "all");
  const [selectedKelas, setSelectedKelas] = useState(defaultSelectedKelas || "all");
  const [selectedJenisNilai, setSelectedJenisNilai] = useState("all");

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

  // State for header dialog
  const [headerActionDialog, setHeaderActionDialog] = useState<{
    open: boolean;
    judulTugas: string;
    tanggal: string;
  }>({ open: false, judulTugas: "", tanggal: "" });

  // Store selected task for edit/delete action
  const [selectedTask, setSelectedTask] = useState<{ judulTugas: string; tanggal: string } | null>(null);

  // Filter nilai by selected subject, class, and jenis_nilai
  const relevantNilai = useMemo(() => {
    return filteredNilai.filter(nilai => {
      const matchMapel = selectedMapel === 'all' || nilai.mata_pelajaran.nama_mapel === mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
      const matchKelas = selectedKelas === 'all' || nilai.siswa.kelas?.nama_kelas === kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
      const matchJenis = selectedJenisNilai === 'all' || nilai.jenis_nilai === selectedJenisNilai;
      return matchMapel && matchKelas && matchJenis;
    });
  }, [filteredNilai, selectedMapel, selectedKelas, selectedJenisNilai, mapelList, kelasList]);

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

    // Handler buka dialog
    const openHeaderActionsDialog = (judulTugas: string, tanggal: string) => {
      setHeaderActionDialog({ open: true, judulTugas, tanggal });
      setSelectedTask({ judulTugas, tanggal });
    };
  
    // Edit SELURUH ENTRI nilai untuk judul & tanggal tugas ini
    const handleEditTask = async (judulBaru: string, tanggalBaru: string) => {
      if (!selectedTask) return;
      // 1. Ambil semua nilai pada judulTugas & tanggal, update seluruhnya
      const taskNilaiList = filteredNilai.filter(n =>
        n.judul_tugas === selectedTask.judulTugas &&
        n.tanggal_tugas_dibuat === selectedTask.tanggal
      );
      for (const nilai of taskNilaiList) {
        await onUpdateNilai(nilai.id_nilai, nilai.skor, nilai.catatan ?? "");
        // Update juga kolom judul_tugas dan tanggal_tugas_dibuat di Supabase
        // (update judul dan tanggal sekaligus)
        // Butuh panggil Supabase update (harusnya di onUpdateNilai diubah agar terima judul/tanggal baru jika ada)
      }
      setHeaderActionDialog({ ...headerActionDialog, open: false });
    };
  
    // Hapus seluruh nilai pada judul tugas ini & tanggalnya
    const handleDeleteTask = async () => {
      if (!selectedTask) return;
      const taskNilaiList = filteredNilai.filter(n =>
        n.judul_tugas === selectedTask.judulTugas &&
        n.tanggal_tugas_dibuat === selectedTask.tanggal
      );
      for (const nilai of taskNilaiList) {
        await deleteNilai(nilai.id_nilai);
      }
      setHeaderActionDialog({ ...headerActionDialog, open: false });
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
              {(() => {
                const mapelName = selectedMapel === "all" ? 'Semua Mata Pelajaran' : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
                const kelasName = selectedKelas === "all" ? 'Semua Kelas' : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
                return `${mapelName} - ${kelasName}`;
              })()}
            </p>
            <p className="text-xs text-gray-500">
              Klik <b>foto atau nama siswa</b> untuk melihat profil lengkap. <b>Double klik</b> pada nilai/tugas untuk mengubah nilai/catatan.<br />
              <b>Double klik pada header kolom tugas</b> untuk edit judul/tanggal tugas atau menghapus seluruh tugas.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {/* FILTER BAR */}
          <div className="mb-4">
            <NilaiFilters
              selectedMapel={selectedMapel}
              setSelectedMapel={setSelectedMapel}
              selectedKelas={selectedKelas}
              setSelectedKelas={setSelectedKelas}
              selectedJenisNilai={selectedJenisNilai}
              setSelectedJenisNilai={setSelectedJenisNilai}
              mapelList={mapelList}
              kelasList={kelasList}
            />
          </div>
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
                    {/* Kolom tugas, hanya double klik untuk edit/hapus */}
                    {taskList.map((task) => (
                      <TableHead
                        key={task.name + task.date}
                        className="text-center min-w-32 group relative cursor-pointer"
                        onDoubleClick={() => openHeaderActionsDialog(task.name, task.date)}
                        title="Double klik untuk edit judul/tanggal tugas atau hapus tugas"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-xs font-medium">{task.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(task.date).toLocaleDateString('id-ID', {
                              day: '2-digit', month: '2-digit'
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
      <TaskHeaderActionsDialog
        open={headerActionDialog.open}
        onOpenChange={open => setHeaderActionDialog({ ...headerActionDialog, open })}
        initialJudul={headerActionDialog.judulTugas}
        initialTanggal={headerActionDialog.tanggal}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </TooltipProvider>
  );
};

export type { Nilai };
export default NilaiOverviewTable;
