import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfilSiswaPopup from '../ProfilSiswaPopup';
import EditAbsensiDialog from './EditAbsensiDialog';
import EditJurnalDialog from './EditJurnalDialog';
import DeleteJurnalDialog from './DeleteJurnalDialog';
import AbsensiTableHeader from './AbsensiTableHeader';
import AbsensiTableRow from './AbsensiTableRow';

interface RiwayatAbsensi {
  id_absensi: string;
  status: string;
  catatan?: string;
  created_at: string;
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
  jurnal_harian: {
    id_jurnal: string;
    tanggal_pelajaran: string;
    judul_materi: string;
    materi_diajarkan?: string;
    waktu_mulai?: string;
    waktu_selesai?: string;
    mata_pelajaran: {
      nama_mapel: string;
    };
    kelas: {
      nama_kelas: string;
    };
  };
}

interface AbsensiOverviewTableProps {
  riwayatAbsensi: RiwayatAbsensi[];
  loading: boolean;
  selectedMapel: string;
  selectedKelas: string;
  mapelList: Array<{id_mapel: string; nama_mapel: string}>;
  kelasList: Array<{id_kelas: string; nama_kelas: string}>;
  refreshData?: () => Promise<void>;
}

interface StudentAttendance {
  siswa: RiwayatAbsensi['siswa'];
  attendances: { [dateKey: string]: {status: string; catatan?: string; materi: string; id_absensi: string} };
  summary: {
    hadir: number;
    izin: number;
    sakit: number;
    alpha: number;
    total: number;
    percent: number;
  };
}

const AbsensiOverviewTable: React.FC<AbsensiOverviewTableProps> = ({
  riwayatAbsensi, 
  loading, 
  selectedMapel, 
  selectedKelas,
  mapelList,
  kelasList,
  refreshData
}) => {
  const [selectedSiswa, setSelectedSiswa] = useState<RiwayatAbsensi['siswa'] | null>(null);
  const [isProfilOpen, setIsProfilOpen] = useState(false);
  const [editingAbsensi, setEditingAbsensi] = useState<{
    id_absensi: string;
    status: string;
    catatan?: string;
    siswa_nama: string;
    tanggal: string;
    materi: string;
  } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [editingJurnal, setEditingJurnal] = useState<{
    id_jurnal: string;
    judul_materi: string;
    tanggal_pelajaran: string;
    materi_diajarkan: string;
    waktu_mulai: string;
    waktu_selesai: string;
  } | null>(null);
  const [isEditJurnalDialogOpen, setIsEditJurnalDialogOpen] = useState(false);
  const [isDeleteJurnalDialogOpen, setIsDeleteJurnalDialogOpen] = useState(false);
  const [jurnalToDelete, setJurnalToDelete] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Filter absensi by selected subject and class
  const relevantAbsensi = useMemo(() => {
    return riwayatAbsensi.filter(absensi => {
      const matchMapel = selectedMapel === 'all' || absensi.jurnal_harian.mata_pelajaran.nama_mapel === mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
      const matchKelas = selectedKelas === 'all' || absensi.jurnal_harian.kelas.nama_kelas === kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
      return matchMapel && matchKelas;
    });
  }, [riwayatAbsensi, selectedMapel, selectedKelas, mapelList, kelasList]);

  // Group absensi by student and date
  const studentAttendanceData = useMemo(() => {
    const grouped: { [siswaId: string]: StudentAttendance } = {};

    relevantAbsensi.forEach(absensi => {
      const siswaId = absensi.siswa.id_siswa;
      const dateKey = new Date(absensi.jurnal_harian.tanggal_pelajaran).toLocaleDateString('id-ID');
      
      if (!grouped[siswaId]) {
        grouped[siswaId] = {
          siswa: absensi.siswa,
          attendances: {},
          summary: { hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0, percent: 0 }
        };
      }

      grouped[siswaId].attendances[dateKey] = {
        status: absensi.status,
        catatan: absensi.catatan,
        materi: absensi.jurnal_harian.judul_materi,
        id_absensi: absensi.id_absensi
      };
    });

    // Calculate summaries
    Object.values(grouped).forEach(studentData => {
      const attendances = Object.values(studentData.attendances);
      const hadir = attendances.filter(a => a.status === 'Hadir').length;
      const total = attendances.length;
      const percent = total > 0 ? (hadir / total * 100) : 0;
      studentData.summary = {
        hadir,
        izin: attendances.filter(a => a.status === 'Izin').length,
        sakit: attendances.filter(a => a.status === 'Sakit').length,
        alpha: attendances.filter(a => a.status === 'Alpha').length,
        total,
        percent,
      };
    });

    return Object.values(grouped).sort((a, b) => a.siswa.nama_lengkap.localeCompare(b.siswa.nama_lengkap));
  }, [relevantAbsensi]);

  // Get all unique dates and their materials for table headers
  const dateList = useMemo(() => {
    const dateMap = new Map<string, string>();
    
    relevantAbsensi.forEach(absensi => {
      const dateKey = new Date(absensi.jurnal_harian.tanggal_pelajaran).toLocaleDateString('id-ID');
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, absensi.jurnal_harian.judul_materi);
      }
    });
    
    return Array.from(dateMap.entries()).sort((a, b) => {
      const dateA = new Date(a[0].split('/').reverse().join('-'));
      const dateB = new Date(b[0].split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  }, [relevantAbsensi]);

  // Event handlers
  const handleAbsensiDoubleClick = (attendance: any, dateKey: string, siswa: any) => {
    if (attendance && attendance.id_absensi) {
      setEditingAbsensi({
        id_absensi: attendance.id_absensi,
        status: attendance.status,
        catatan: attendance.catatan || '',
        siswa_nama: siswa.nama_lengkap,
        tanggal: dateKey,
        materi: attendance.materi
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleJurnalDoubleClick = (dateKey: string, materi: string) => {
    const jurnalEntry = relevantAbsensi.find(absensi => {
      const absensiDate = new Date(absensi.jurnal_harian.tanggal_pelajaran).toLocaleDateString('id-ID');
      return absensiDate === dateKey && absensi.jurnal_harian.judul_materi === materi;
    })?.jurnal_harian;

    if (jurnalEntry) {
      setEditingJurnal({
        id_jurnal: jurnalEntry.id_jurnal,
        judul_materi: jurnalEntry.judul_materi,
        tanggal_pelajaran: jurnalEntry.tanggal_pelajaran,
        materi_diajarkan: jurnalEntry.materi_diajarkan || '',
        waktu_mulai: jurnalEntry.waktu_mulai || '',
        waktu_selesai: jurnalEntry.waktu_selesai || ''
      });
      setIsEditJurnalDialogOpen(true);
    }
  };

  const showJurnalMenu = (dateKey: string, materi: string, event: React.MouseEvent) => {
    event.preventDefault();
    const jurnalEntry = relevantAbsensi.find(absensi => {
      const absensiDate = new Date(absensi.jurnal_harian.tanggal_pelajaran).toLocaleDateString('id-ID');
      return absensiDate === dateKey && absensi.jurnal_harian.judul_materi === materi;
    })?.jurnal_harian;

    if (jurnalEntry) {
      setJurnalToDelete(jurnalEntry.id_jurnal);
      setEditingJurnal({
        id_jurnal: jurnalEntry.id_jurnal,
        judul_materi: jurnalEntry.judul_materi,
        tanggal_pelajaran: jurnalEntry.tanggal_pelajaran,
        materi_diajarkan: jurnalEntry.materi_diajarkan || '',
        waktu_mulai: jurnalEntry.waktu_mulai || '',
        waktu_selesai: jurnalEntry.waktu_selesai || ''
      });
    }
  };

  const handleSiswaClick = (siswa: RiwayatAbsensi['siswa']) => {
    setSelectedSiswa(siswa);
    setIsProfilOpen(true);
  };

  const getSelectedInfo = () => {
    const mapelName = selectedMapel === 'all' ? 'Semua Mata Pelajaran' : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
    const kelasName = selectedKelas === 'all' ? 'Semua Kelas' : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
    return `${mapelName} - ${kelasName}`;
  };

  // --- Add the missing handler stubs ---
  // You may fill these with logic as needed, or connect to backend/parent logic
  const handleSaveAbsensi = async () => {
    // TODO: implement saving for absensi
    console.log('handleSaveAbsensi not implemented');
  };

  const handleSaveJurnal = async () => {
    // TODO: implement saving for jurnal
    console.log('handleSaveJurnal not implemented');
  };

  const handleDeleteJurnal = async () => {
    // TODO: implement delete for jurnal
    console.log('handleDeleteJurnal not implemented');
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi Absensi Siswa</CardTitle>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-600">
              {getSelectedInfo()}
            </p>
            <p className="text-xs text-gray-500">
              Klik nama atau foto siswa untuk melihat profil lengkap. Double klik kehadiran untuk mengedit. Double klik judul/tanggal untuk menu jurnal.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <AbsensiTableHeader
                  dateList={dateList}
                  onJurnalDoubleClick={handleJurnalDoubleClick}
                  onJurnalContextMenu={showJurnalMenu}
                />
                <TableBody>
                  {studentAttendanceData.map((studentData) => (
                    <AbsensiTableRow
                      key={studentData.siswa.id_siswa}
                      studentData={studentData}
                      dateList={dateList}
                      onSiswaClick={handleSiswaClick}
                      onAbsensiDoubleClick={handleAbsensiDoubleClick}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {!loading && studentAttendanceData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada data absensi sesuai filter yang dipilih
            </div>
          )}
        </CardContent>
      </Card>

      <EditAbsensiDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingAbsensi(null);
        }}
        editingAbsensi={editingAbsensi}
        onSave={handleSaveAbsensi}
        onUpdate={(updates) => setEditingAbsensi(prev => prev ? {...prev, ...updates} : null)}
      />

      <EditJurnalDialog
        isOpen={isEditJurnalDialogOpen}
        onClose={() => {
          setIsEditJurnalDialogOpen(false);
          setEditingJurnal(null);
        }}
        editingJurnal={editingJurnal}
        onSave={handleSaveJurnal}
        onDelete={() => {
          setIsEditJurnalDialogOpen(false);
          setIsDeleteJurnalDialogOpen(true);
        }}
        onUpdate={setEditingJurnal}
      />

      <DeleteJurnalDialog
        isOpen={isDeleteJurnalDialogOpen}
        onClose={() => {
          setIsDeleteJurnalDialogOpen(false);
          setJurnalToDelete(null);
        }}
        onConfirm={handleDeleteJurnal}
      />

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

export default AbsensiOverviewTable;
