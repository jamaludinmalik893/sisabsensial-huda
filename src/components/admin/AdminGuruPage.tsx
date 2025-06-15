
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Guru, Kelas, MataPelajaran, UserSession } from '@/types';

interface AdminGuruPageProps {
  userSession: UserSession;
}

interface GuruWithKelas extends Guru {
  kelas_wali?: { nama_kelas: string };
}

const AdminGuruPage: React.FC<AdminGuruPageProps> = ({ userSession }) => {
  const [guruList, setGuruList] = useState<GuruWithKelas[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<Guru | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nip: '',
    nama_lengkap: '',
    email: '',
    password: '',
    nomor_telepon: '',
    alamat: '',
    wali_kelas: '',
    status: 'guru' as 'admin' | 'guru',
    mata_pelajaran: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch guru with relations
      const { data: guruData, error: guruError } = await supabase
        .from('guru')
        .select(`
          *,
          kelas_wali:wali_kelas(nama_kelas)
        `);

      if (guruError) throw guruError;

      // Fetch kelas
      const { data: kelasData, error: kelasError } = await supabase
        .from('kelas')
        .select('*')
        .order('nama_kelas');

      if (kelasError) throw kelasError;

      // Fetch mata pelajaran
      const { data: mapelData, error: mapelError } = await supabase
        .from('mata_pelajaran')
        .select('*')
        .order('nama_mapel');

      if (mapelError) throw mapelError;

      // Transform guru data to match our types
      const transformedGuruData = guruData?.map(guru => ({
        ...guru,
        status: guru.status as 'admin' | 'guru',
        kelas_wali: guru.kelas_wali
      })) || [];

      setGuruList(transformedGuruData);
      setKelasList(kelasData || []);
      setMataPelajaranList(mapelData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data guru",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const guruFormData = {
        nip: formData.nip,
        nama_lengkap: formData.nama_lengkap,
        email: formData.email,
        password: formData.password,
        nomor_telepon: formData.nomor_telepon,
        alamat: formData.alamat,
        wali_kelas: formData.wali_kelas || null,
        status: formData.status
      };

      if (editingGuru) {
        // Update guru
        const { error } = await supabase
          .from('guru')
          .update(guruFormData)
          .eq('id_guru', editingGuru.id_guru);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Data guru berhasil diperbarui",
        });
      } else {
        // Create new guru
        const { data: newGuru, error } = await supabase
          .from('guru')
          .insert(guruFormData)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Guru baru berhasil ditambahkan",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving guru:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan data guru",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (guru: GuruWithKelas) => {
    setEditingGuru(guru);
    setFormData({
      nip: guru.nip,
      nama_lengkap: guru.nama_lengkap,
      email: guru.email,
      password: '',
      nomor_telepon: guru.nomor_telepon || '',
      alamat: guru.alamat || '',
      wali_kelas: guru.wali_kelas || '',
      status: guru.status,
      mata_pelajaran: []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id_guru: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus guru ini?')) return;

    try {
      const { error } = await supabase
        .from('guru')
        .delete()
        .eq('id_guru', id_guru);

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Guru berhasil dihapus",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting guru:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus guru",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nip: '',
      nama_lengkap: '',
      email: '',
      password: '',
      nomor_telepon: '',
      alamat: '',
      wali_kelas: '',
      status: 'guru',
      mata_pelajaran: []
    });
    setEditingGuru(null);
  };

  const filteredGuru = guruList.filter(guru => 
    guru.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guru.nip.includes(searchTerm) ||
    guru.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <User className="h-6 w-6" />
          Administrasi Guru
        </h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Guru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingGuru ? 'Edit Guru' : 'Tambah Guru Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingGuru ? 'Edit informasi guru yang sudah ada' : 'Tambahkan guru baru ke dalam sistem'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nip">NIP</Label>
                  <Input
                    id="nip"
                    value={formData.nip}
                    onChange={(e) => setFormData({...formData, nip: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                  <Input
                    id="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editingGuru ? "Kosongkan jika tidak ingin mengubah" : ""}
                    required={!editingGuru}
                  />
                </div>
                <div>
                  <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                  <Input
                    id="nomor_telepon"
                    value={formData.nomor_telepon}
                    onChange={(e) => setFormData({...formData, nomor_telepon: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'admin' | 'guru') => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guru">Guru</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input
                    id="alamat"
                    value={formData.alamat}
                    onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="wali_kelas">Wali Kelas (Opsional)</Label>
                  <Select value={formData.wali_kelas} onValueChange={(value) => setFormData({...formData, wali_kelas: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kelas untuk menjadi wali" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tidak menjadi wali kelas</SelectItem>
                      {kelasList.map((kelas) => (
                        <SelectItem key={kelas.id_kelas} value={kelas.id_kelas}>
                          {kelas.nama_kelas}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingGuru ? 'Perbarui' : 'Simpan'}
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
              placeholder="Cari guru (nama, NIP, atau email)..."
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
          <CardTitle>Daftar Guru ({filteredGuru.length} guru)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIP</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wali Kelas</TableHead>
                <TableHead>No. Telepon</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuru.map((guru) => (
                <TableRow key={guru.id_guru}>
                  <TableCell className="font-mono">{guru.nip}</TableCell>
                  <TableCell className="font-medium">{guru.nama_lengkap}</TableCell>
                  <TableCell>{guru.email}</TableCell>
                  <TableCell>
                    <Badge variant={guru.status === 'admin' ? 'default' : 'secondary'}>
                      {guru.status === 'admin' ? 'Admin' : 'Guru'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {guru.kelas_wali ? (
                      <Badge variant="outline">{guru.kelas_wali.nama_kelas}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{guru.nomor_telepon || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(guru)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(guru.id_guru)}
                        disabled={guru.id_guru === userSession.guru.id_guru}
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
    </div>
  );
};

export default AdminGuruPage;
