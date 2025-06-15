import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserSession } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BookOpen, Clock, Calendar, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JurnalFilter from './jurnal/JurnalFilter';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface JurnalPageProps {
  userSession: UserSession;
}

interface JurnalEntry {
  id_jurnal: string;
  tanggal_pelajaran: string;
  waktu_mulai: string;
  waktu_selesai: string;
  judul_materi: string;
  materi_diajarkan: string;
  mata_pelajaran: {
    nama_mapel: string;
  };
  kelas: {
    nama_kelas: string;
  };
}

interface Kelas {
  id_kelas: string;
  nama_kelas: string;
}

interface MataPelajaran {
  id_mapel: string;
  nama_mapel: string;
}

interface FilterState {
  kelas: string;
  mapel: string;
  bulan: string;
}

const JurnalPage: React.FC<JurnalPageProps> = ({ userSession }) => {
  const [jurnalList, setJurnalList] = useState<JurnalEntry[]>([]);
  const [filteredJurnalList, setFilteredJurnalList] = useState<JurnalEntry[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJurnal, setSelectedJurnal] = useState<JurnalEntry | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    kelas: 'all',
    mapel: 'all',
    bulan: new Date().toISOString().slice(0, 7) // Current month
  });
  const [formData, setFormData] = useState({
    id_kelas: '',
    id_mapel: '',
    tanggal_pelajaran: new Date().toISOString().split('T')[0],
    waktu_mulai: '',
    waktu_selesai: '',
    judul_materi: '',
    materi_diajarkan: ''
  });
  const [editFormData, setEditFormData] = useState({
    id_jurnal: '',
    id_kelas: '',
    id_mapel: '',
    tanggal_pelajaran: '',
    waktu_mulai: '',
    waktu_selesai: '',
    judul_materi: '',
    materi_diajarkan: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, [userSession]);

  useEffect(() => {
    applyFilters();
  }, [jurnalList, filters]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadJurnal(),
        loadKelas(),
        loadMataPelajaranByGuru(), // ganti function agar hanya mapel guru ini
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // hanya mapel yang diampu guru yang login
  const loadMataPelajaranByGuru = async () => {
    try {
      const { data, error } = await supabase
        .from('guru_mata_pelajaran')
        .select('mata_pelajaran(id_mapel, nama_mapel)')
        .eq('id_guru', userSession.guru.id_guru);

      if (error) throw error;
      const mapelData = data?.map((item: any) => item.mata_pelajaran).flat() || [];
      setMapelList(mapelData);
    } catch (error) {
      console.error('Error loading mapel guru:', error);
    }
  };

  const loadJurnal = async () => {
    try {
      const { data, error } = await supabase
        .from('jurnal_harian')
        .select(`
          id_jurnal,
          tanggal_pelajaran,
          waktu_mulai,
          waktu_selesai,
          judul_materi,
          materi_diajarkan,
          id_kelas,
          id_mapel,
          mata_pelajaran!inner(nama_mapel),
          kelas!inner(nama_kelas)
        `)
        .eq('id_guru', userSession.guru.id_guru)
        .order('tanggal_pelajaran', { ascending: false });

      if (error) throw error;
      setJurnalList(data || []);
    } catch (error) {
      console.error('Error loading jurnal:', error);
    }
  };

  const loadKelas = async () => {
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select('id_kelas, nama_kelas')
        .order('nama_kelas');

      if (error) throw error;
      setKelasList(data || []);
    } catch (error) {
      console.error('Error loading kelas:', error);
    }
  };

  // --- UPDATE HERE: Filter jurnal untuk hanya jurnal dari mapel yang benar-benar diampu guru login ---
  const applyFilters = () => {
    // Daftar id_mapel yang diampu oleh guru
    const guruMapelIds = mapelList.map(mapel => mapel.id_mapel);
    // Filter: hanya jurnal dari mapel yang benar-benar diampu (untuk antisipasi ada data jurnal salah mapel/id_guru).
    let filtered = [...jurnalList].filter(jurnal =>
      guruMapelIds.includes((jurnal as any).id_mapel)
    );

    // Filter by kelas
    if (filters.kelas !== 'all') {
      filtered = filtered.filter(jurnal => 
        (jurnal as any).id_kelas === filters.kelas
      );
    }

    // Filter by mata pelajaran
    if (filters.mapel !== 'all') {
      filtered = filtered.filter(jurnal => 
        (jurnal as any).id_mapel === filters.mapel
      );
    }

    // Filter by month
    if (filters.bulan) {
      filtered = filtered.filter(jurnal => {
        const jurnalMonth = jurnal.tanggal_pelajaran.slice(0, 7);
        return jurnalMonth === filters.bulan;
      });
    }

    setFilteredJurnalList(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id_kelas || !formData.id_mapel || !formData.judul_materi || !formData.materi_diajarkan) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('jurnal_harian')
        .insert({
          id_guru: userSession.guru.id_guru,
          id_kelas: formData.id_kelas,
          id_mapel: formData.id_mapel,
          tanggal_pelajaran: formData.tanggal_pelajaran,
          waktu_mulai: formData.waktu_mulai,
          waktu_selesai: formData.waktu_selesai,
          judul_materi: formData.judul_materi,
          materi_diajarkan: formData.materi_diajarkan
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Jurnal pembelajaran berhasil ditambahkan"
      });

      setIsDialogOpen(false);
      setFormData({
        id_kelas: '',
        id_mapel: '',
        tanggal_pelajaran: new Date().toISOString().split('T')[0],
        waktu_mulai: '',
        waktu_selesai: '',
        judul_materi: '',
        materi_diajarkan: ''
      });
      loadJurnal();
    } catch (error) {
      console.error('Error saving jurnal:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan jurnal pembelajaran",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (jurnal: JurnalEntry) => {
    setEditFormData({
      id_jurnal: jurnal.id_jurnal,
      id_kelas: (jurnal as any).id_kelas,
      id_mapel: (jurnal as any).id_mapel,
      tanggal_pelajaran: jurnal.tanggal_pelajaran,
      waktu_mulai: jurnal.waktu_mulai,
      waktu_selesai: jurnal.waktu_selesai,
      judul_materi: jurnal.judul_materi,
      materi_diajarkan: jurnal.materi_diajarkan,
    });
    setSelectedJurnal(jurnal);
    setEditDialogOpen(true);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi wajib isi
    if (
      !editFormData.id_kelas ||
      !editFormData.id_mapel ||
      !editFormData.judul_materi ||
      !editFormData.materi_diajarkan
    ) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }
    try {
      const { error } = await supabase
        .from('jurnal_harian')
        .update({
          id_kelas: editFormData.id_kelas,
          id_mapel: editFormData.id_mapel,
          tanggal_pelajaran: editFormData.tanggal_pelajaran,
          waktu_mulai: editFormData.waktu_mulai,
          waktu_selesai: editFormData.waktu_selesai,
          judul_materi: editFormData.judul_materi,
          materi_diajarkan: editFormData.materi_diajarkan,
        })
        .eq('id_jurnal', editFormData.id_jurnal);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Jurnal berhasil diperbarui"
      });

      setEditDialogOpen(false);
      setSelectedJurnal(null);
      loadJurnal();
    } catch (error) {
      console.error('Error updating jurnal:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui jurnal",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (jurnal: JurnalEntry) => {
    setSelectedJurnal(jurnal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteJurnal = async () => {
    if (!selectedJurnal) return;
    try {
      const { error } = await supabase
        .from('jurnal_harian')
        .delete()
        .eq('id_jurnal', selectedJurnal.id_jurnal);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Jurnal berhasil dihapus"
      });

      setDeleteDialogOpen(false);
      setSelectedJurnal(null);
      loadJurnal();
    } catch (error) {
      console.error('Error deleting jurnal:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus jurnal",
        variant: "destructive"
      });
    }
  };

  // Jika BELUM di-filter, sembunyikan tabel dan tampilkan instruksi
  const isFiltered = filters.kelas !== 'all' || filters.mapel !== 'all';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jurnal Pembelajaran</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jurnal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Jurnal Pembelajaran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Kelas *</label>
                  <Select value={formData.id_kelas} onValueChange={(value) => setFormData({...formData, id_kelas: value})}>
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
                  <label className="text-sm font-medium mb-2 block">Mata Pelajaran *</label>
                  <Select value={formData.id_mapel} onValueChange={(value) => setFormData({...formData, id_mapel: value})}>
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tanggal *</label>
                  <Input
                    type="date"
                    value={formData.tanggal_pelajaran}
                    onChange={(e) => setFormData({...formData, tanggal_pelajaran: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Waktu Mulai *</label>
                  <Input
                    type="time"
                    value={formData.waktu_mulai}
                    onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Waktu Selesai *</label>
                  <Input
                    type="time"
                    value={formData.waktu_selesai}
                    onChange={(e) => setFormData({...formData, waktu_selesai: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Judul Materi *</label>
                <Input
                  value={formData.judul_materi}
                  onChange={(e) => setFormData({...formData, judul_materi: e.target.value})}
                  placeholder="Masukkan judul materi"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Materi yang Diajarkan *</label>
                <Textarea
                  value={formData.materi_diajarkan}
                  onChange={(e) => setFormData({...formData, materi_diajarkan: e.target.value})}
                  placeholder="Jelaskan materi yang diajarkan"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{jurnalList.length}</div>
                <div className="text-sm text-gray-500">Total Jurnal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {jurnalList.filter(j => j.tanggal_pelajaran === new Date().toISOString().split('T')[0]).length}
                </div>
                <div className="text-sm text-gray-500">Hari Ini</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {jurnalList.filter(j => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(j.tanggal_pelajaran) >= weekAgo;
                  }).length}
                </div>
                <div className="text-sm text-gray-500">Minggu Ini</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <JurnalFilter
        kelasList={kelasList}
        mapelList={mapelList}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Jurnal Pembelajaran ({filteredJurnalList.length} jurnal)</CardTitle>
        </CardHeader>
        <CardContent>
          {!isFiltered ? (
            <div className="text-center py-8 text-gray-500 border rounded-lg bg-gray-50">
              Silakan pilih <b>kelas</b> atau <b>mata pelajaran</b> terlebih dahulu untuk menampilkan data jurnal pembelajaran.
            </div>
          ) : loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead>Judul Materi</TableHead>
                  <TableHead>Materi Diajarkan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJurnalList.map((jurnal) => (
                  <TableRow key={jurnal.id_jurnal}>
                    <TableCell>
                      {new Date(jurnal.tanggal_pelajaran).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {jurnal.waktu_mulai} - {jurnal.waktu_selesai}
                      </Badge>
                    </TableCell>
                    <TableCell>{jurnal.kelas.nama_kelas}</TableCell>
                    <TableCell>{jurnal.mata_pelajaran.nama_mapel}</TableCell>
                    <TableCell className="font-medium">{jurnal.judul_materi}</TableCell>
                    <TableCell className="max-w-xs truncate">{jurnal.materi_diajarkan}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label="Edit jurnal"
                          onClick={() => openEditDialog(jurnal)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          aria-label="Hapus jurnal"
                          onClick={() => openDeleteDialog(jurnal)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && isFiltered && filteredJurnalList.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada jurnal yang sesuai dengan filter
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Edit Jurnal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Jurnal Pembelajaran</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Kelas *</label>
                <Select value={editFormData.id_kelas} onValueChange={(value) => handleEditChange('id_kelas', value)}>
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
                <label className="text-sm font-medium mb-2 block">Mata Pelajaran *</label>
                <Select value={editFormData.id_mapel} onValueChange={(value) => handleEditChange('id_mapel', value)}>
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tanggal *</label>
                <Input
                  type="date"
                  value={editFormData.tanggal_pelajaran}
                  onChange={(e) => handleEditChange('tanggal_pelajaran', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Waktu Mulai *</label>
                <Input
                  type="time"
                  value={editFormData.waktu_mulai}
                  onChange={(e) => handleEditChange('waktu_mulai', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Waktu Selesai *</label>
                <Input
                  type="time"
                  value={editFormData.waktu_selesai}
                  onChange={(e) => handleEditChange('waktu_selesai', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Judul Materi *</label>
              <Input
                value={editFormData.judul_materi}
                onChange={(e) => handleEditChange('judul_materi', e.target.value)}
                placeholder="Masukkan judul materi"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Materi yang Diajarkan *</label>
              <Textarea
                value={editFormData.materi_diajarkan}
                onChange={(e) => handleEditChange('materi_diajarkan', e.target.value)}
                placeholder="Jelaskan materi yang diajarkan"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Konfirmasi Hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jurnal?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jurnal <b>{selectedJurnal?.judul_materi}</b>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJurnal}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JurnalPage;
