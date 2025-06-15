
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { School, Plus, Edit2, Trash2, Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Kelas, UserSession } from '@/types';

interface AdminKelasPageProps {
  userSession: UserSession;
}

interface KelasWithCount extends Kelas {
  jumlah_siswa?: number;
}

const AdminKelasPage: React.FC<AdminKelasPageProps> = ({ userSession }) => {
  const [kelasList, setKelasList] = useState<KelasWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nama_kelas: '',
    logo_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch kelas with student count
      const { data: kelasData, error: kelasError } = await supabase
        .from('kelas')
        .select(`
          *,
          siswa(count)
        `);

      if (kelasError) throw kelasError;

      // Transform data to include student count properly
      const kelasWithCount: KelasWithCount[] = kelasData?.map(kelas => ({
        id_kelas: kelas.id_kelas,
        nama_kelas: kelas.nama_kelas,
        logo_url: kelas.logo_url,
        created_at: kelas.created_at,
        updated_at: kelas.updated_at,
        jumlah_siswa: Array.isArray(kelas.siswa) && kelas.siswa.length > 0 ? kelas.siswa[0].count : 0
      })) || [];

      setKelasList(kelasWithCount);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kelas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingKelas) {
        // Update kelas
        const { error } = await supabase
          .from('kelas')
          .update(formData)
          .eq('id_kelas', editingKelas.id_kelas);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Data kelas berhasil diperbarui",
        });
      } else {
        // Create new kelas
        const { error } = await supabase
          .from('kelas')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Kelas baru berhasil ditambahkan",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving kelas:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data kelas",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (kelas: KelasWithCount) => {
    setEditingKelas(kelas);
    setFormData({
      nama_kelas: kelas.nama_kelas,
      logo_url: kelas.logo_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id_kelas: string) => {
    // Check if there are students in this class
    const { data: siswaData, error: siswaError } = await supabase
      .from('siswa')
      .select('id_siswa')
      .eq('id_kelas', id_kelas)
      .limit(1);

    if (siswaError) {
      toast({
        title: "Error",
        description: "Gagal memeriksa data siswa",
        variant: "destructive"
      });
      return;
    }

    if (siswaData && siswaData.length > 0) {
      toast({
        title: "Error",
        description: "Tidak dapat menghapus kelas yang masih memiliki siswa",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return;

    try {
      const { error } = await supabase
        .from('kelas')
        .delete()
        .eq('id_kelas', id_kelas);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Kelas berhasil dihapus",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting kelas:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus kelas",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nama_kelas: '',
      logo_url: ''
    });
    setEditingKelas(null);
  };

  const filteredKelas = kelasList.filter(kelas => 
    kelas.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase())
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
          <School className="h-6 w-6" />
          Administrasi Kelas
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kelas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingKelas ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama_kelas">Nama Kelas</Label>
                <Input
                  id="nama_kelas"
                  value={formData.nama_kelas}
                  onChange={(e) => setFormData({...formData, nama_kelas: e.target.value})}
                  placeholder="Contoh: X RPL 1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="logo_url">URL Logo (Opsional)</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingKelas ? 'Perbarui' : 'Simpan'}
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
              placeholder="Cari kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKelas.map((kelas) => (
          <Card key={kelas.id_kelas}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{kelas.nama_kelas}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(kelas)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(kelas.id_kelas)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{kelas.jumlah_siswa || 0} siswa</span>
                </div>
                {kelas.logo_url && (
                  <div className="mt-3">
                    <img 
                      src={kelas.logo_url} 
                      alt={`Logo ${kelas.nama_kelas}`}
                      className="w-12 h-12 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredKelas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada kelas yang ditambahkan</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminKelasPage;
