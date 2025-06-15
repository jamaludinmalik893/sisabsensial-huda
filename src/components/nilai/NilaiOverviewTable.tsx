import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StudentCell from './StudentCell';
import NilaiEditCell from './NilaiEditCell';
import NilaiDisplayCell from './NilaiDisplayCell';
import ProfilSiswaPopup from '../ProfilSiswaPopup';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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
}

interface StudentGrades {
  siswa: Nilai['siswa'];
  grades: { [taskKey: string]: {skor: number; tanggal: string; catatan?: string; id_nilai: string} };
  average: number;
}

interface EditingCell {
  studentId: string;
  taskKey: string;
  skor: string;
  catatan: string;
}

const NilaiOverviewTable: React.FC<NilaiOverviewTableProps> = ({
  filteredNilai,
  loading,
  selectedMapel,
  selectedKelas,
  mapelList,
  kelasList,
  onUpdateNilai
}) => {
  const [selectedSiswa, setSelectedSiswa] = useState<Nilai['siswa'] | null>(null);
  const [isProfilOpen, setIsProfilOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

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
          id_nilai: nilai.id_nilai
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

  /**
   * Updates: remove the edit icon, and start editing
   * score/note by double-clicking the cell value.
   */
  const startEditing = (studentId: string, taskKey: string, grade: { skor: number; catatan?: string }) => {
    setEditingCell({
      studentId,
      taskKey,
      skor: grade.skor.toString(),
      catatan: grade.catatan || ''
    });
  };

  const cancelEditing = () => setEditingCell(null);

  const saveEdit = async () => {
    if (!editingCell) return;
    const studentData = studentGradesData.find(s => s.siswa.id_siswa === editingCell.studentId);
    const grade = studentData?.grades[editingCell.taskKey];
    if (!grade) return;
    try {
      await onUpdateNilai(
        grade.id_nilai,
        parseFloat(editingCell.skor),
        editingCell.catatan
      );
      setEditingCell(null);
    } catch (error) {
      console.error('Error updating nilai:', error);
    }
  };

  const isEditing = (studentId: string, taskKey: string) => {
    return editingCell?.studentId === studentId && editingCell?.taskKey === taskKey;
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
              Klik nama siswa atau ikon untuk melihat profil lengkap. <b>Double klik</b> pada nilai/tugas untuk mengubah nilai/catatan.
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
                    <TableHead className="min-w-16"></TableHead>
                    <TableHead className="min-w-40">Nama Siswa</TableHead>
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
                    <TableHead className="text-center min-w-20 font-semibold">Rata-rata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentGradesData.map((studentData) => (
                    <TableRow key={studentData.siswa.id_siswa} className="hover:bg-gray-50 group">
                      <TableCell className="p-2">
                        {/* Student icon only cell 
                            This is purposely left empty. 
                            Profil handled in StudentCell below.
                        */}
                      </TableCell>
                      <TableCell className="p-2">
                        <StudentCell
                          siswa={studentData.siswa}
                          onClickProfil={handleSiswaClick}
                        />
                      </TableCell>
                      {taskList.map((task) => (
                        <TableCell key={task.name} className="text-center p-2">
                          {studentData.grades[task.name] !== undefined ? (
                            isEditing(studentData.siswa.id_siswa, task.name) ? (
                              <NilaiEditCell
                                skor={editingCell?.skor || ''}
                                catatan={editingCell?.catatan || ''}
                                onChangeSkor={(val) =>
                                  setEditingCell(prev => prev ? { ...prev, skor: val } : null)
                                }
                                onChangeCatatan={(val) =>
                                  setEditingCell(prev => prev ? { ...prev, catatan: val } : null)
                                }
                                onSave={saveEdit}
                                onCancel={cancelEditing}
                              />
                            ) : (
                              <NilaiDisplayCell
                                skor={studentData.grades[task.name].skor}
                                catatan={studentData.grades[task.name].catatan}
                                getScoreColor={getScoreColor}
                                onDoubleClick={() =>
                                  startEditing(
                                    studentData.siswa.id_siswa,
                                    task.name,
                                    studentData.grades[task.name]
                                  )
                                }
                              />
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center p-2">
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
    </TooltipProvider>
  );
};

export type { Nilai };
export default NilaiOverviewTable;
