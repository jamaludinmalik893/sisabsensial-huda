
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MataPelajaran, UserSession } from '@/types';

interface AdminMapelPageProps {
  userSession: UserSession;
}

const AdminMapelPage: React.FC<AdminMapelPageProps> = ({ userSession }) => {
  const [mapelList, setMapelList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapel, setEditingMapel] = useState<MataPelajaran | null>(null);
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
      
      const { data: mapelData, error: mapelError } = await supabase
        .from('mata_pelajaran')
        .select('*')
        .order('nama_mapel');

      if (mapelError) throw mapelError;

      setMapelList(mapelData || []);
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
      if (editingMapel) {
        // Update mata pelajaran
        const { error } = await supabase
          .from('mata_pelajaran')
          .update(formData)
          .eq('id_mapel', editingMapel.id_mapel);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Data mata pelajaran berhasil diperbarui",
        });
      } else {
        // Create new mata pelajaran
        const { error } = await supabase
          .from('mata_pelajaran')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Mata pelajaran baru berhasil ditambahkan",
        });
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

  const handleEdit = (mapel: MataPelajaran) => {
    setEditingMapel(mapel);
    setFormData({
      nama_mapel: mapel.nama_mapel
    });
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
    setEditingMapel(null);
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
          <DialogContent>
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
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMapel.map((mapel) => (
                <TableRow key={mapel.id_mapel}>
                  <TableCell className="font-medium">{mapel.nama_mapel}</TableCell>
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
