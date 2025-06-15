
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Plus, Edit2, Trash2, Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MataPelajaran, UserSession, Guru } from '@/types';

interface AdminMapelPageProps {
  userSession: UserSession;
}

interface MapelWithGuru extends MataPelajaran {
  guru_pengampu?: Guru[];
}

const AdminMapelPage: React.FC<AdminMapelPageProps> = ({ userSession }) => {
  const [mapelList, setMapelList] = useState<MapelWithGuru[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<MapelWithGuru | null>(null);
  const [selectedGuru, setSelectedGuru] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nama_mapel: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Load mata pelajaran dengan guru pengampunya
      const { data: mapelData, error: mapelError } = await supabase
        .from('mata_pelajaran')
        .select(`
          *,
          guru_mata_pelajaran(
            guru(id_guru, nama_lengkap, nip)
          )
        `)
        .order('nama_mapel');

      if (mapelError) throw mapelError;

      // Transform data untuk menyesuaikan interface
      const transformedMapel = mapelData?.map(mapel => ({
        ...mapel,
        guru_pengampu: mapel.guru_mata_pelajaran?.map((gmp: any) => gmp.guru) || []
      })) || [];

      setMapelList(transformedMapel);

      // Load semua guru
      const { data: guruData, error: guruError } = await supabase
        .from('guru')
        .select('id_guru, nama_lengkap, nip')
        .order('nama_lengkap');

      if (guruError) throw guruError;
      setGuruList(guruData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data mata pelajaran",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let mapelId: string;

      if (editingMapel) {
        // Update mata pelajaran
        const { error } = await supabase
          .from('mata_pelajaran')
          .update(formData)
          .eq('id_mapel', editingMapel.id_mapel);

        if (error) throw error;
        mapelId = editingMapel.id_mapel;

        toast({
          title: "Sukses",
          description: "Data mata pelajaran berhasil diperbarui",
        });
      } else {
        // Create new mata pelajaran
        const { data, error } = await supabase
          .from('mata_pelajaran')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;
        mapelId = data.id_mapel;

        toast({
          title: "Sukses",
          description: "Mata pelajaran baru berhasil ditambahkan",
        });
      }

      // Update guru pengampu
      if (editingMapel) {
        // Hapus semua guru pengampu yang lama
        await supabase
          .from('guru_mata_pelajaran')
          .delete()
          .eq('id_mapel', mapelId);
      }

      // Tambahkan guru pengampu yang baru
      if (selectedGuru.length > 0) {
        const guruMapelData = selectedGuru.map(idGuru => ({
          id_guru: idGuru,
          id_mapel: mapelId
        }));

        const { error: guruMapelError } = await supabase
          .from('guru_mata_pelajaran')
          .insert(guruMapelData);

        if (guruMapelError) throw guruMapelError;
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving mata pelajaran:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data mata pelajaran",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (mapel: MapelWithGuru) => {
    setEditingMapel(mapel);
    setFormData({
      nama_mapel: mapel.nama_mapel
    });
    setSelectedGuru(mapel.guru_pengampu?.map(g => g.id_guru) || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id_mapel: string) => {
    // Check if there are journals using this subject
    const { data: jurnalData, error: jurnalError } = await supabase
      .from('jurnal_harian')
      .select('id_jurnal')
      .eq('id_mapel', id_mapel)
      .limit(1);

    if (jurnalError) {
      toast({
        title: "Error",
        description: "Gagal memeriksa data jurnal",
        variant: "destructive"
      });
      return;
    }

    if (jurnalData && jurnalData.length > 0) {
      toast({
        title: "Error",
        description: "Tidak dapat menghapus mata pelajaran yang masih digunakan dalam jurnal",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) return;

    try {
      const { error } = await supabase
        .from('mata_pelajaran')
        .delete()
        .eq('id_mapel', id_mapel);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Mata pelajaran berhasil dihapus",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting mata pelajaran:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus mata pelajaran",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nama_mapel: ''
    });
    setSelectedGuru([]);
    setEditingMapel(null);
  };

  const handleGuruSelection = (guruId: string, checked: boolean) => {
    if (checked) {
      setSelectedGuru(prev => [...prev, guruId]);
    } else {
      setSelectedGuru(prev => prev.filter(id => id !== guruId));
    }
  };

  const filteredMapel = mapelList.filter(mapel => 
    mapel.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Administrasi Mata Pelajaran
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Mata Pelajaran
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMapel ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama_mapel">Nama Mata Pelajaran</Label>
                <Input
                  id="nama_mapel"
                  value={formData.nama_mapel}
                  onChange={(e) => setFormData({...formData, nama_mapel: e.target.value})}
                  placeholder="Contoh: Pemrograman Web"
                  required
                />
              </div>

              <div>
                <Label>Guru Pengampu</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {guruList.map((guru) => (
                    <div key={guru.id_guru} className="flex items-center space-x-2">
                      <Checkbox
                        id={guru.id_guru}
                        checked={selectedGuru.includes(guru.id_guru)}
                        onCheckedChange={(checked) => handleGuruSelection(guru.id_guru, checked as boolean)}
                      />
                      <label htmlFor={guru.id_guru} className="text-sm cursor-pointer">
                        {guru.nama_lengkap} ({guru.nip})
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih satu atau lebih guru yang mengampu mata pelajaran ini
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingMapel ? 'Perbarui' : 'Simpan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari mata pelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Mata Pelajaran ({filteredMapel.length} mata pelajaran)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Mata Pelajaran</TableHead>
                <TableHead>Guru Pengampu</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMapel.map((mapel) => (
                <TableRow key={mapel.id_mapel}>
                  <TableCell className="font-medium">{mapel.nama_mapel}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {mapel.guru_pengampu && mapel.guru_pengampu.length > 0 ? (
                        mapel.guru_pengampu.map((guru) => (
                          <Badge key={guru.id_guru} variant="secondary" className="text-xs">
                            {guru.nama_lengkap}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Belum ada guru</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {mapel.created_at ? new Date(mapel.created_at).toLocaleDateString('id-ID') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(mapel)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(mapel.id_mapel)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredMapel.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada mata pelajaran yang ditambahkan</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminMapelPage;
