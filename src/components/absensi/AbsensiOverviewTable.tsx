import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Users, MessageCircle, Edit, Trash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfilSiswaPopup from '../ProfilSiswaPopup';
import StudentAvatarCell from "../nilai/StudentAvatarCell";

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
  refreshData?: () => Promise<void>; // Tambahan (opsional supaya tidak breaking)
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
  
  // New states for journal editing
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
          summary: { hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 }
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
      studentData.summary = {
        hadir: attendances.filter(a => a.status === 'Hadir').length,
        izin: attendances.filter(a => a.status === 'Izin').length,
        sakit: attendances.filter(a => a.status === 'Sakit').length,
        alpha: attendances.filter(a => a.status === 'Alpha').length,
        total: attendances.length
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
    // Find the journal entry for this date and material
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

  const handleSaveAbsensi = async () => {
    if (!editingAbsensi) return;

    try {
      const { error } = await supabase
        .from('absensi')
        .update({
          status: editingAbsensi.status,
          catatan: editingAbsensi.catatan || null
        })
        .eq('id_absensi', editingAbsensi.id_absensi);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data absensi berhasil diperbarui",
      });

      setIsEditDialogOpen(false);
      setEditingAbsensi(null);
      
      if (typeof refreshData === "function") {
        await refreshData();
      }
      
    } catch (error) {
      console.error('Error updating absensi:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data absensi",
        variant: "destructive"
      });
    }
  };

  const handleSaveJurnal = async () => {
    if (!editingJurnal) return;

    try {
      const { error } = await supabase
        .from('jurnal_harian')
        .update({
          judul_materi: editingJurnal.judul_materi,
          tanggal_pelajaran: editingJurnal.tanggal_pelajaran,
          materi_diajarkan: editingJurnal.materi_diajarkan,
          waktu_mulai: editingJurnal.waktu_mulai,
          waktu_selesai: editingJurnal.waktu_selesai
        })
        .eq('id_jurnal', editingJurnal.id_jurnal);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data jurnal berhasil diperbarui",
      });

      setIsEditJurnalDialogOpen(false);
      setEditingJurnal(null);
      
      if (typeof refreshData === "function") {
        await refreshData();
      }
      
    } catch (error) {
      console.error('Error updating jurnal:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data jurnal",
        variant: "destructive"
      });
    }
  };

  const handleDeleteJurnal = async () => {
    if (!jurnalToDelete) return;

    try {
      // First delete all related absensi records
      const { error: absensiError } = await supabase
        .from('absensi')
        .delete()
        .eq('id_jurnal', jurnalToDelete);

      if (absensiError) throw absensiError;

      // Then delete the jurnal
      const { error: jurnalError } = await supabase
        .from('jurnal_harian')
        .delete()
        .eq('id_jurnal', jurnalToDelete);

      if (jurnalError) throw jurnalError;

      toast({
        title: "Berhasil",
        description: "Jurnal dan data absensi terkait berhasil dihapus",
      });

      setIsDeleteJurnalDialogOpen(false);
      setJurnalToDelete(null);
      
      if (typeof refreshData === "function") {
        await refreshData();
      }
      
    } catch (error) {
      console.error('Error deleting jurnal:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus jurnal",
        variant: "destructive"
      });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hadir': return 'bg-green-100 text-green-800';
      case 'Izin': return 'bg-yellow-100 text-yellow-800';
      case 'Sakit': return 'bg-blue-100 text-blue-800';
      case 'Alpha': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSelectedInfo = () => {
    const mapelName = selectedMapel === 'all' ? 'Semua Mata Pelajaran' : mapelList.find(m => m.id_mapel === selectedMapel)?.nama_mapel;
    const kelasName = selectedKelas === 'all' ? 'Semua Kelas' : kelasList.find(k => k.id_kelas === selectedKelas)?.nama_kelas;
    return `${mapelName} - ${kelasName}`;
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
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead className="min-w-40">Nama Siswa</TableHead>
                    {dateList.slice(0, 10).map(([date, materi]) => (
                      <TableHead key={date} className="text-center min-w-24">
                        <div className="flex flex-col">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className="cursor-pointer hover:bg-blue-50 p-1 rounded"
                                onDoubleClick={() => handleJurnalDoubleClick(date, materi)}
                                onContextMenu={(e) => showJurnalMenu(date, materi, e)}
                              >
                                <span className="text-xs font-medium text-blue-600 mb-1">
                                  {materi.length > 15 ? `${materi.substring(0, 15)}...` : materi}
                                </span>
                                <br />
                                <span className="text-xs">{date}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p>Materi: {materi}</p>
                                <p>Tanggal: {date}</p>
                                <p className="text-gray-400 mt-1">Double klik untuk edit jurnal</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-16 bg-green-50">H</TableHead>
                    <TableHead className="text-center min-w-16 bg-yellow-50">I</TableHead>
                    <TableHead className="text-center min-w-16 bg-blue-50">S</TableHead>
                    <TableHead className="text-center min-w-16 bg-red-50">A</TableHead>
                    <TableHead className="text-center min-w-20 font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAttendanceData.map((studentData) => (
                    <TableRow key={studentData.siswa.id_siswa} className="hover:bg-gray-50">
                      <TableCell className="p-2">
                        <StudentAvatarCell
                          siswa={studentData.siswa}
                          onClick={() => handleSiswaClick(studentData.siswa)}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell className="p-2 align-middle">
                        <button
                          onClick={() => handleSiswaClick(studentData.siswa)}
                          className="text-left hover:text-blue-600 hover:underline transition-colors"
                        >
                          <div className="text-sm font-medium">{studentData.siswa.nama_lengkap}</div>
                          <div className="text-xs text-gray-500">{studentData.siswa.nisn}</div>
                        </button>
                      </TableCell>
                      {dateList.slice(0, 10).map(([date]) => (
                        <TableCell key={date} className="text-center p-2">
                          {studentData.attendances[date] ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className="relative cursor-pointer"
                                  onDoubleClick={() => handleAbsensiDoubleClick(
                                    studentData.attendances[date], 
                                    date, 
                                    studentData.siswa
                                  )}
                                >
                                  <Badge 
                                    className={`text-xs ${getStatusColor(studentData.attendances[date].status)}`}
                                  >
                                    {studentData.attendances[date].status.charAt(0)}
                                  </Badge>
                                  {studentData.attendances[date].catatan && (
                                    <MessageCircle className="absolute -top-1 -right-1 h-3 w-3 text-blue-500" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs">
                                  <p>Status: {studentData.attendances[date].status}</p>
                                  <p>Materi: {studentData.attendances[date].materi}</p>
                                  {studentData.attendances[date].catatan && (
                                    <p>Catatan: {studentData.attendances[date].catatan}</p>
                                  )}
                                  <p className="text-gray-400 mt-1">Double klik untuk edit</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center p-2 bg-green-50">
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                          {studentData.summary.hadir}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-2 bg-yellow-50">
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                          {studentData.summary.izin}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-2 bg-blue-50">
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                          {studentData.summary.sakit}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-2 bg-red-50">
                        <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                          {studentData.summary.alpha}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center p-2">
                        <Badge variant="outline" className="text-xs font-semibold">
                          {studentData.summary.total}
                        </Badge>
                      </TableCell>
                    </TableRow>
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

      {/* Edit Absensi Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kehadiran</DialogTitle>
          </DialogHeader>
          {editingAbsensi && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Siswa</Label>
                <p className="text-sm">{editingAbsensi.siswa_nama}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tanggal</Label>
                <p className="text-sm">{editingAbsensi.tanggal}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Materi</Label>
                <p className="text-sm">{editingAbsensi.materi}</p>
              </div>
              <div>
                <Label htmlFor="status">Status Kehadiran</Label>
                <Select 
                  value={editingAbsensi.status} 
                  onValueChange={(value) => setEditingAbsensi({...editingAbsensi, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hadir">Hadir</SelectItem>
                    <SelectItem value="Izin">Izin</SelectItem>
                    <SelectItem value="Sakit">Sakit</SelectItem>
                    <SelectItem value="Alpha">Alpha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="catatan">Catatan (Opsional)</Label>
                <Textarea
                  id="catatan"
                  value={editingAbsensi.catatan}
                  onChange={(e) => setEditingAbsensi({...editingAbsensi, catatan: e.target.value})}
                  placeholder="Tambahkan catatan..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingAbsensi(null);
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleSaveAbsensi}>
                  Simpan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Jurnal Dialog */}
      <Dialog open={isEditJurnalDialogOpen} onOpenChange={setIsEditJurnalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Jurnal Harian
            </DialogTitle>
          </DialogHeader>
          {editingJurnal && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="judul_materi">Judul Materi</Label>
                <Input
                  id="judul_materi"
                  value={editingJurnal.judul_materi}
                  onChange={(e) => setEditingJurnal({...editingJurnal, judul_materi: e.target.value})}
                  placeholder="Masukkan judul materi..."
                />
              </div>
              <div>
                <Label htmlFor="tanggal_pelajaran">Tanggal Pelajaran</Label>
                <Input
                  id="tanggal_pelajaran"
                  type="date"
                  value={editingJurnal.tanggal_pelajaran}
                  onChange={(e) => setEditingJurnal({...editingJurnal, tanggal_pelajaran: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waktu_mulai">Waktu Mulai</Label>
                  <Input
                    id="waktu_mulai"
                    type="time"
                    value={editingJurnal.waktu_mulai}
                    onChange={(e) => setEditingJurnal({...editingJurnal, waktu_mulai: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="waktu_selesai">Waktu Selesai</Label>
                  <Input
                    id="waktu_selesai"
                    type="time"
                    value={editingJurnal.waktu_selesai}
                    onChange={(e) => setEditingJurnal({...editingJurnal, waktu_selesai: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="materi_diajarkan">Materi yang Diajarkan</Label>
                <Textarea
                  id="materi_diajarkan"
                  value={editingJurnal.materi_diajarkan}
                  onChange={(e) => setEditingJurnal({...editingJurnal, materi_diajarkan: e.target.value})}
                  placeholder="Deskripsi materi yang diajarkan..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-between">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsEditJurnalDialogOpen(false);
                    setIsDeleteJurnalDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Trash className="h-4 w-4" />
                  Hapus
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditJurnalDialogOpen(false);
                      setEditingJurnal(null);
                    }}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleSaveJurnal}>
                    Simpan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Jurnal Confirmation Dialog */}
      <AlertDialog open={isDeleteJurnalDialogOpen} onOpenChange={setIsDeleteJurnalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jurnal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jurnal ini? Semua data absensi yang terkait juga akan dihapus. 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteJurnalDialogOpen(false);
              setJurnalToDelete(null);
            }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJurnal} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
